/**
 * Job pump — the shared submit/collect logic that moves a job through listflow.
 *
 * Used from three places, all idempotent and safe to overlap:
 *   • POST /api/v1/image   → submitOne right away (no wait for a cron tick)
 *   • GET  /api/v1/jobs/:id → collectOne when the client polls a processing job
 *   • /api/cron/process-jobs → submitOne + collectOne as the backstop that also
 *                              finishes jobs whose client stopped polling
 *
 * Money safety: the wallet is only deducted by whoever wins the atomic
 * processing→completed flip, so route + cron racing can never double-charge.
 */

import { createServiceClient } from "@/lib/supabase/service";
import { uploadOutputFromBase64 } from "@/lib/storage/upload-output";
import { notifyJobFailed, notifyLowBalance } from "@/lib/notifications/telegram";

type Service = ReturnType<typeof createServiceClient>;

const LISTFLOW_BASE = "https://listflow.pro";
// 12 dk: GPT 6 dk denenir, sonra listflow tarafındaki Gemini→Runware yedek
// zincirinin üretip teslim etmesi için pay bırakılır (eskiden 8 dk'ydı).
export const PROCESSING_TIMEOUT_MS = 12 * 60 * 1000; // give up on a stuck job (no charge)

export interface InFlightJob {
  id: string;
  user_id: string;
  pricing_snapshot: Record<string, unknown> | null;
  started_at: string | null;
}

function listflowHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.LISTFLOW_API_SECRET ?? ""}`,
  };
}

// Pull "<bucket>/<path>" out of any Supabase storage URL (public/sign/authenticated).
function parseStoragePath(url: string): { bucket: string; path: string } | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?([^/?]+)\/([^?]+)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
}

// Our reference images live in a PRIVATE bucket, so hand listflow a short-lived
// signed URL it can fetch — never the raw base64 (keeps request bodies small).
async function signInputImage(service: Service, imageUrl: string): Promise<string | undefined> {
  const parsed = parseStoragePath(imageUrl);
  if (!parsed) return undefined;
  const { data, error } = await service.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, 2 * 60 * 60); // 2h — plenty for pickup
  if (error || !data?.signedUrl) {
    console.error("[pump] signing reference image failed:", error?.message);
    return undefined;
  }
  return data.signedUrl;
}

async function requeue(service: Service, jobId: string): Promise<void> {
  await service
    .from("jobs")
    .update({ status: "queued", started_at: null })
    .eq("id", jobId)
    .eq("status", "processing");
}

// Atomic processing → failed. Returns true only if this caller made the change.
async function markFailed(service: Service, jobId: string, reason: string, userId?: string): Promise<boolean> {
  const { data: claimed } = await service
    .from("jobs")
    .update({ status: "failed", error_message: reason, completed_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "processing")
    .select("id");

  const changed = !!claimed && claimed.length > 0;
  if (changed && userId) notifyJobFailed(userId, jobId, reason).catch(() => {});
  return changed;
}

/**
 * Claim a queued job and hand it to listflow's external queue.
 * Returns: "submitted" | "claimed-by-other" | "failed" | "requeued".
 */
export async function submitOne(
  service: Service,
  jobId: string,
  prompt: string,
  imageUrl?: string,
): Promise<string> {
  // Atomic claim: queued → processing. Only one caller wins this row.
  const { data: claimed } = await service
    .from("jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "queued")
    .select("id");

  if (!claimed || claimed.length === 0) return "claimed-by-other";

  // Reference image (image-to-image): send listflow a signed URL it can fetch.
  const signedImage = imageUrl ? await signInputImage(service, imageUrl) : undefined;

  try {
    const res = await fetch(`${LISTFLOW_BASE}/api/external/generate`, {
      method: "POST",
      headers: listflowHeaders(),
      body: JSON.stringify({
        job_id: jobId,
        prompt,
        mode: "both",
        ...(signedImage ? { image_url: signedImage } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // 4xx = permanent (bad request / secret mismatch) → fail fast.
      // 5xx / network = transient → put it back for the next attempt.
      if (res.status >= 400 && res.status < 500) {
        await markFailed(service, jobId, `listflow rejected submit (HTTP ${res.status}): ${text.slice(0, 150)}`);
        return "failed";
      }
      await requeue(service, jobId);
      return "requeued";
    }

    return "submitted";
  } catch (err) {
    await requeue(service, jobId);
    console.error(`[pump] submit ${jobId} failed:`, (err as Error).message);
    return "requeued";
  }
}

/**
 * Check listflow for an in-flight job and finalize it if ready.
 * Returns the terminal status ("completed" | "failed") if it changed, else null.
 */
export async function collectOne(service: Service, job: InFlightJob): Promise<string | null> {
  let result: { status?: string; image_base64?: string } | null = null;

  try {
    const res = await fetch(`${LISTFLOW_BASE}/api/external/jobs/${job.id}`, { headers: listflowHeaders() });
    if (res.ok) result = (await res.json()) as { status?: string; image_base64?: string };
    // Non-OK (incl. 404 "not there yet") → fall through to the timeout guard.
  } catch {
    // transient — try again on the next poll/tick
  }

  if (result?.status === "done" && result.image_base64) {
    return (await finalizeCompleted(service, job, result.image_base64)) ? "completed" : null;
  }

  if (result?.status === "suspended") {
    return (await markFailed(service, job.id, "listflow suspended the job after too many worker retries", job.user_id))
      ? "failed"
      : null;
  }

  const startedMs = job.started_at ? new Date(job.started_at).getTime() : 0;
  if (startedMs && Date.now() - startedMs > PROCESSING_TIMEOUT_MS) {
    return (await markFailed(service, job.id, "timed out waiting for the image", job.user_id)) ? "failed" : null;
  }

  return null;
}

// Store the image, then atomically finalize + charge exactly once.
async function finalizeCompleted(service: Service, job: InFlightJob, base64: string): Promise<boolean> {
  const priceUsd = Number(job.pricing_snapshot?.price_usd ?? 0);

  // Upload first. If it fails, leave the job processing and retry later —
  // never complete/charge a job whose image we couldn't store.
  const upload = await uploadOutputFromBase64(job.user_id, job.id, base64, "image/png");
  if ("error" in upload) {
    console.error(`[pump] output upload failed for ${job.id}: ${upload.error}`);
    return false;
  }

  // Atomic claim: processing → completed. Only the winner records + charges.
  const { data: claimed } = await service
    .from("jobs")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "processing")
    .select("id");

  if (!claimed || claimed.length === 0) return false; // finalized elsewhere

  await service.from("job_outputs").insert({
    job_id: job.id,
    output_type: "image",
    file_url: upload.url,
    text_content: null,
    metadata: { source: "listflow", response_type: "base64", via: "pump" },
  });

  const { data: profile } = await service
    .from("profiles")
    .select("wallet_balance, email")
    .eq("id", job.user_id)
    .single();

  const newBalance = Math.max(0, Number(profile?.wallet_balance ?? 0) - priceUsd);

  await Promise.all([
    service.from("profiles").update({ wallet_balance: newBalance }).eq("id", job.user_id),
    service.from("transactions").insert({
      user_id: job.user_id,
      job_id: job.id,
      type: "usage",
      amount_usd: priceUsd,
      status: "paid",
      metadata: { model_code: job.pricing_snapshot?.model_code, via: "pump" },
    }),
  ]);

  if (newBalance < 0.1) {
    notifyLowBalance(profile?.email ?? job.user_id, newBalance).catch(() => {});
  }

  return true;
}

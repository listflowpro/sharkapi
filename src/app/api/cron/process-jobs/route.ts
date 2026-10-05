import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { uploadOutputFromBase64 } from "@/lib/storage/upload-output";
import { notifyJobFailed, notifyLowBalance } from "@/lib/notifications/telegram";

/**
 * Serverless job pump — runs every minute via Vercel Cron.
 *
 * Replaces the old Redis queue + standalone worker. Nothing to keep running,
 * no external queue service. Two fast phases per tick:
 *
 *   Phase 1 (submit):  queued   → POST listflow /api/external/generate → processing
 *   Phase 2 (collect): processing → GET  listflow /api/external/jobs/:id
 *                        done      → store image, charge wallet, completed
 *                        suspended → failed (no charge)
 *                        stuck     → failed after PROCESSING_TIMEOUT (no charge)
 *
 * listflow uses OUR job.id as its external_job_id, so no id mapping is needed.
 * Each phase only touches a bounded batch, so a tick stays well within the
 * function time limit (the long image generation happens on listflow's side,
 * and we just check back on the next tick).
 *
 * Money safety: the wallet is only ever deducted by the tick that wins the
 * atomic processing→completed flip, so overlapping ticks can never double-charge.
 *
 * Backlog safety: only jobs queued within RECENT_WINDOW_MS are picked up, so the
 * stale backlog that piled up while the system was down is never charged.
 */

export const maxDuration = 60;

const LISTFLOW_BASE = "https://listflow.pro";
const SUBMIT_LIMIT = 10; // new jobs submitted per tick
const COLLECT_LIMIT = 15; // in-flight jobs checked per tick
const RECENT_WINDOW_MS = 30 * 60 * 1000; // ignore jobs older than this (stale backlog)
const PROCESSING_TIMEOUT_MS = 8 * 60 * 1000; // give up on a stuck in-flight job (no charge)

type Service = ReturnType<typeof createServiceClient>;

interface QueuedJob {
  id: string;
  input_data: Record<string, unknown>;
}

interface InFlightJob {
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

// ── Phase 1: hand queued jobs to listflow ──────────────────────────────
async function submitQueued(service: Service) {
  const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();

  const { data } = await service
    .from("jobs")
    .select("id, input_data")
    .eq("status", "queued")
    .gte("queued_at", since)
    .order("queued_at", { ascending: true })
    .limit(SUBMIT_LIMIT);

  const jobs = (data ?? []) as QueuedJob[];
  let submitted = 0;
  let failed = 0;

  await Promise.allSettled(
    jobs.map(async (job) => {
      // Atomic claim: queued → processing. Only one tick wins this row.
      const { data: claimed } = await service
        .from("jobs")
        .update({ status: "processing", started_at: new Date().toISOString() })
        .eq("id", job.id)
        .eq("status", "queued")
        .select("id");

      if (!claimed || claimed.length === 0) return; // claimed elsewhere

      try {
        const res = await fetch(`${LISTFLOW_BASE}/api/external/generate`, {
          method: "POST",
          headers: listflowHeaders(),
          body: JSON.stringify({
            job_id: job.id,
            prompt: String(job.input_data?.prompt ?? ""),
            mode: "both",
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          // 4xx = permanent (bad request / secret mismatch) → fail fast, no retry loop.
          // 5xx / network = transient → put back in the queue for the next tick.
          if (res.status >= 400 && res.status < 500) {
            await markFailed(service, job.id, `listflow rejected submit (HTTP ${res.status}): ${text.slice(0, 150)}`);
            failed++;
          } else {
            await service
              .from("jobs")
              .update({ status: "queued", started_at: null })
              .eq("id", job.id)
              .eq("status", "processing");
          }
          return;
        }

        submitted++;
      } catch (err) {
        // Network error → transient → back to the queue.
        await service
          .from("jobs")
          .update({ status: "queued", started_at: null })
          .eq("id", job.id)
          .eq("status", "processing");
        console.error(`[cron] submit ${job.id} failed:`, (err as Error).message);
      }
    }),
  );

  return { submitted, submitFailed: failed };
}

// ── Phase 2: collect finished jobs from listflow ───────────────────────
async function collectInFlight(service: Service) {
  const { data } = await service
    .from("jobs")
    .select("id, user_id, pricing_snapshot, started_at")
    .eq("status", "processing")
    .order("started_at", { ascending: true })
    .limit(COLLECT_LIMIT);

  const jobs = (data ?? []) as InFlightJob[];
  let completed = 0;
  let failed = 0;
  let pending = 0;

  await Promise.allSettled(
    jobs.map(async (job) => {
      let result: { status?: string; image_base64?: string } | null = null;

      try {
        const res = await fetch(`${LISTFLOW_BASE}/api/external/jobs/${job.id}`, {
          headers: listflowHeaders(),
        });
        if (res.ok) {
          result = (await res.json()) as { status?: string; image_base64?: string };
        }
        // Non-OK (incl. 404 "not found yet") → fall through to the timeout guard.
      } catch {
        // transient — try again next tick
      }

      if (result?.status === "done" && result.image_base64) {
        const ok = await finalizeCompleted(service, job, result.image_base64);
        if (ok) completed++;
        else pending++; // upload hiccup — retry next tick
        return;
      }

      if (result?.status === "suspended") {
        if (await markFailed(service, job.id, "listflow suspended the job after too many worker retries", job.user_id)) failed++;
        return;
      }

      // still running, unknown, or transiently unreachable → honour the timeout
      const startedMs = job.started_at ? new Date(job.started_at).getTime() : 0;
      if (startedMs && Date.now() - startedMs > PROCESSING_TIMEOUT_MS) {
        if (await markFailed(service, job.id, "timed out waiting for the image", job.user_id)) failed++;
        return;
      }

      pending++;
    }),
  );

  return { completed, failed, pending };
}

// Store image, then atomically finalize + charge exactly once.
async function finalizeCompleted(service: Service, job: InFlightJob, base64: string): Promise<boolean> {
  const priceUsd = Number(job.pricing_snapshot?.price_usd ?? 0);

  // Upload first. If it fails, leave the job as "processing" and retry next tick
  // (never complete/charge a job we couldn't store an image for).
  const upload = await uploadOutputFromBase64(job.user_id, job.id, base64, "image/png");
  if ("error" in upload) {
    console.error(`[cron] output upload failed for ${job.id}: ${upload.error}`);
    return false;
  }

  // Atomic claim: processing → completed. Only the winner records + charges.
  const { data: claimed } = await service
    .from("jobs")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("status", "processing")
    .select("id");

  if (!claimed || claimed.length === 0) return false; // finalized by another tick

  await service.from("job_outputs").insert({
    job_id: job.id,
    output_type: "image",
    file_url: upload.url,
    text_content: null,
    metadata: { source: "listflow", response_type: "base64", via: "cron" },
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
      metadata: { model_code: job.pricing_snapshot?.model_code, via: "cron" },
    }),
  ]);

  if (newBalance < 0.1) {
    notifyLowBalance(profile?.email ?? job.user_id, newBalance).catch(() => {});
  }

  return true;
}

// Atomic processing → failed. Returns true only if this tick made the change.
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

async function run(req: NextRequest) {
  // Same auth convention as the daily-summary cron: enforced only if CRON_SECRET is set.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.LISTFLOW_API_SECRET) {
    return NextResponse.json({ error: "LISTFLOW_API_SECRET is not configured." }, { status: 500 });
  }

  const service = createServiceClient();
  try {
    const submit = await submitQueued(service);
    const collect = await collectInFlight(service);
    return NextResponse.json({ ok: true, ...submit, ...collect });
  } catch (err) {
    console.error("[cron] process-jobs error:", err);
    return NextResponse.json({ error: "process-jobs failed", detail: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return run(req);
}

// Allow manual triggering too (same logic/auth).
export async function POST(req: NextRequest) {
  return run(req);
}

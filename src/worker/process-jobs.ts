/**
 * Job processor — runs queued jobs through the provider pipeline.
 * Call from /api/worker/run (cron or manual trigger).
 *
 * Lifecycle: queued → processing → completed | failed
 */

import { createServiceClient } from "@/lib/supabase/service";
import { generateImage } from "@/lib/providers/dropthatship";

const BATCH_SIZE = 5;

export async function processJobs(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const service = createServiceClient();
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  const { data: jobs, error: fetchError } = await service
    .from("jobs")
    .select("id, model_id, input_data, pricing_snapshot, user_id")
    .eq("status", "queued")
    .order("queued_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    results.errors.push(`fetch error: ${fetchError.message}`);
    return results;
  }

  if (!jobs || jobs.length === 0) return results;

  await Promise.allSettled(
    jobs.map(async (job) => {
      try {
        await processOne(service, job);
        results.processed++;
      } catch (err) {
        results.failed++;
        results.errors.push(`job ${job.id}: ${String(err)}`);
      }
    })
  );

  return results;
}

async function processOne(
  service: ReturnType<typeof createServiceClient>,
  job: {
    id: string;
    model_id: string | null;
    input_data: Record<string, unknown>;
    pricing_snapshot: Record<string, unknown>;
    user_id: string;
  }
) {
  const now = () => new Date().toISOString();
  const priceUsd = Number(job.pricing_snapshot?.price_usd ?? 0);

  // ── Mark as processing (optimistic lock) ────────────────────
  await service
    .from("jobs")
    .update({ status: "processing", started_at: now() })
    .eq("id", job.id)
    .eq("status", "queued");

  // ── Call provider (synchronous within worker) ────────────────
  let providerResult: Awaited<ReturnType<typeof generateImage>>;

  try {
    providerResult = await generateImage({
      message:   String(job.input_data.prompt ?? ""),
      image_url: job.input_data.image_url as string | undefined,
      image:     job.input_data.image     as string | undefined,
    });
  } catch (err) {
    await service
      .from("jobs")
      .update({
        status:        "failed",
        error_message: String(err),
        completed_at:  now(),
      })
      .eq("id", job.id);
    throw err;
  }

  // ── Write output based on response type ──────────────────────
  if (providerResult.type === "url") {
    await service.from("job_outputs").insert({
      job_id:       job.id,
      output_type:  "image",
      file_url:     providerResult.url,
      text_content: null,
      metadata:     { source: "dropthatship", response_type: "url" },
    });

  } else if (providerResult.type === "base64") {
    // Store as data URI in text_content — no storage bucket needed.
    // Frontend reads this as: src={`data:image/png;base64,${text_content}`}
    const dataUri = `data:${providerResult.mimeType};base64,${providerResult.data}`;
    await service.from("job_outputs").insert({
      job_id:       job.id,
      output_type:  "image",
      file_url:     null,
      text_content: dataUri,
      metadata:     {
        source:        "dropthatship",
        response_type: "base64",
        mime_type:     providerResult.mimeType,
      },
    });
  }

  // ── Deduct wallet & record transaction ────────────────────────
  const { data: profile } = await service
    .from("profiles")
    .select("wallet_balance")
    .eq("id", job.user_id)
    .single();

  const newBalance = Math.max(0, Number(profile?.wallet_balance ?? 0) - priceUsd);

  await Promise.all([
    service
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", job.user_id),

    service.from("transactions").insert({
      user_id:    job.user_id,
      job_id:     job.id,
      type:       "usage",
      amount_usd: priceUsd,
      status:     "paid",
      metadata:   { model_code: job.pricing_snapshot?.model_code },
    }),
  ]);

  // ── Mark as completed ─────────────────────────────────────────
  await service
    .from("jobs")
    .update({ status: "completed", completed_at: now() })
    .eq("id", job.id);
}

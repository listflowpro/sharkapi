/**
 * Single-job processor — used by the queue worker.
 * Fetches job from DB by ID, then runs the full provider pipeline.
 */

import { createServiceClient } from "@/lib/supabase/service";
import { generateImage } from "@/lib/providers/dropthatship";

export async function processJobById(jobId: string): Promise<void> {
  const service = createServiceClient();

  // Fetch full job row
  const { data: job } = await service
    .from("jobs")
    .select("id, model_id, input_data, pricing_snapshot, user_id, status")
    .eq("id", jobId)
    .single();

  if (!job) {
    throw new Error(`job ${jobId} not found`);
  }

  // Idempotency: skip if already picked up by another worker
  if (job.status !== "queued") {
    console.log(`[worker] skipping job ${jobId} (status: ${job.status})`);
    return;
  }

  const now = () => new Date().toISOString();
  const priceUsd = Number(job.pricing_snapshot?.price_usd ?? 0);

  // ── Mark as processing (optimistic lock) ────────────────────
  const { data: claimed } = await service
    .from("jobs")
    .update({ status: "processing", started_at: now() })
    .eq("id", job.id)
    .eq("status", "queued")
    .select("id");

  const count = claimed?.length ?? 0;

  // Another worker claimed it first
  if (count === 0) {
    console.log(`[worker] job ${jobId} already claimed — skipping`);
    return;
  }

  // ── Call provider ────────────────────────────────────────────
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

  // ── Write output ─────────────────────────────────────────────
  if (providerResult.type === "url") {
    await service.from("job_outputs").insert({
      job_id:       job.id,
      output_type:  "image",
      file_url:     providerResult.url,
      text_content: null,
      metadata:     { source: "dropthatship", response_type: "url" },
    });
  } else if (providerResult.type === "base64") {
    const dataUri = `data:${providerResult.mimeType};base64,${providerResult.data}`;
    await service.from("job_outputs").insert({
      job_id:       job.id,
      output_type:  "image",
      file_url:     null,
      text_content: dataUri,
      metadata:     { source: "dropthatship", response_type: "base64", mime_type: providerResult.mimeType },
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

  console.log(`[worker] job ${jobId} completed ($${priceUsd})`);
}

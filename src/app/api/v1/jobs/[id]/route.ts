import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, isApiKeyError } from "@/lib/auth/validate-api-key";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/v1/jobs/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Authenticate ──────────────────────────────────────────
  const auth = await validateApiKey(request);
  if (isApiKeyError(auth)) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId } = auth;

  const { id: jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
  }

  const service = createServiceClient();

  // ── 2. Fetch job (ownership enforced) ───────────────────────
  const { data: job } = await service
    .from("jobs")
    .select(`
      id,
      status,
      source,
      input_data,
      pricing_snapshot,
      error_message,
      queued_at,
      started_at,
      completed_at,
      created_at,
      model:models(name, code, variant, category)
    `)
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (!job) {
    // Return 404 for both "not found" and "wrong owner" — no info leakage
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // ── 3. Fetch outputs if completed ───────────────────────────
  let outputs: Array<{
    id: string;
    output_type: string;
    file_url: string | null;
    text_content: string | null;
    metadata: Record<string, unknown>;
  }> = [];

  if (job.status === "completed") {
    const { data } = await service
      .from("job_outputs")
      .select("id, output_type, file_url, text_content, metadata")
      .eq("job_id", jobId);
    outputs = data ?? [];
  }

  // ── 4. Response ──────────────────────────────────────────────
  return NextResponse.json({
    job_id: job.id,
    status: job.status,
    source: job.source,
    model: job.model,
    input: job.input_data,
    pricing: job.pricing_snapshot,
    error: job.error_message ?? null,
    queued_at: job.queued_at,
    started_at: job.started_at ?? null,
    completed_at: job.completed_at ?? null,
    created_at: job.created_at,
    outputs: outputs.length > 0 ? outputs : null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { validateSession, isSessionError } from "@/lib/auth/validate-session";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Auth ──────────────────────────────────────────────────
  const session = await validateSession();
  if (isSessionError(session)) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const { userId } = session;

  const { id: jobId } = await params;

  const service = createServiceClient();

  // ── 2. Fetch job (ownership enforced) ────────────────────────
  const { data: job } = await service
    .from("jobs")
    .select("id, status, error_message, completed_at, started_at, created_at")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // ── 3. Fetch output if completed ─────────────────────────────
  let output: {
    file_url: string | null;
    text_content: string | null;
    output_type: string;
  } | null = null;

  if (job.status === "completed") {
    const { data } = await service
      .from("job_outputs")
      .select("file_url, text_content, output_type")
      .eq("job_id", jobId)
      .limit(1)
      .single();
    output = data ?? null;
  }

  return NextResponse.json({
    job_id: job.id,
    status: job.status,
    error: job.error_message ?? null,
    output,
    started_at: job.started_at ?? null,
    completed_at: job.completed_at ?? null,
    created_at: job.created_at,
  });
}

import { NextResponse } from "next/server";
import { validateSession, isSessionError } from "@/lib/auth/validate-session";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const session = await validateSession();
  if (isSessionError(session)) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const { userId } = session;

  const service = createServiceClient();

  const { data: jobs } = await service
    .from("jobs")
    .select(`
      id,
      input_data,
      pricing_snapshot,
      created_at,
      job_outputs ( file_url, text_content )
    `)
    .eq("user_id", userId)
    .eq("source", "playground")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (jobs ?? []).map((job) => {
    const out = Array.isArray(job.job_outputs) ? job.job_outputs[0] : job.job_outputs;
    return {
      job_id:     job.id,
      prompt:     String(job.input_data?.prompt ?? ""),
      variant:    String(job.pricing_snapshot?.variant ?? "1k"),
      price_usd:  Number(job.pricing_snapshot?.price_usd ?? 0),
      created_at: job.created_at,
      image_url:  out?.file_url ?? out?.text_content ?? null,
    };
  }).filter((item) => item.image_url);

  return NextResponse.json({ items });
}

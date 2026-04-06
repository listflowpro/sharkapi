import { NextRequest, NextResponse } from "next/server";
import { processJobs } from "@/worker/process-jobs";

// POST /api/worker/run
// Trigger: cron job, Vercel Cron, or manual call with WORKER_SECRET header
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-worker-secret");
  const expected = process.env.WORKER_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processJobs();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("worker error:", err);
    return NextResponse.json({ error: "Worker failed." }, { status: 500 });
  }
}

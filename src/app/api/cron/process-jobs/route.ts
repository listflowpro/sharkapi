import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { submitOne, collectOne, type InFlightJob } from "@/lib/queue/pump";

/**
 * Serverless backstop — runs every minute via Vercel Cron.
 *
 * The fast path is now instant: POST /api/v1/image submits right away, and the
 * client's own polling of GET /api/v1/jobs/:id collects the result as soon as
 * it is ready. This cron is the safety net: it submits anything the fast path
 * missed and, crucially, finishes jobs whose client stopped polling (so no job
 * is ever left stuck in "processing").
 *
 * Only jobs queued within RECENT_WINDOW_MS are picked up, so the stale backlog
 * that built up while the system was down is never charged.
 */

export const maxDuration = 60;

const SUBMIT_LIMIT = 10;
const COLLECT_LIMIT = 15;
const RECENT_WINDOW_MS = 30 * 60 * 1000;

interface QueuedJob {
  id: string;
  input_data: Record<string, unknown>;
}

async function run(req: NextRequest) {
  // Same auth convention as the daily-summary cron: enforced only if CRON_SECRET is set.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.LISTFLOW_API_SECRET) {
    return NextResponse.json({ error: "LISTFLOW_API_SECRET is not configured." }, { status: 500 });
  }

  const service = createServiceClient();

  try {
    // ── Phase 1: submit any still-queued recent jobs (fast path missed them) ──
    const since = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
    const { data: queuedData } = await service
      .from("jobs")
      .select("id, input_data")
      .eq("status", "queued")
      .gte("queued_at", since)
      .order("queued_at", { ascending: true })
      .limit(SUBMIT_LIMIT);

    const queued = (queuedData ?? []) as QueuedJob[];
    const submitResults = await Promise.allSettled(
      queued.map((j) => submitOne(service, j.id, String(j.input_data?.prompt ?? ""))),
    );
    const submitted = submitResults.filter((r) => r.status === "fulfilled" && r.value === "submitted").length;

    // ── Phase 2: finish any in-flight jobs (incl. abandoned ones) ──
    const { data: inflightData } = await service
      .from("jobs")
      .select("id, user_id, pricing_snapshot, started_at")
      .eq("status", "processing")
      .order("started_at", { ascending: true })
      .limit(COLLECT_LIMIT);

    const inflight = (inflightData ?? []) as InFlightJob[];
    const collectResults = await Promise.allSettled(inflight.map((j) => collectOne(service, j)));
    let completed = 0;
    let failed = 0;
    let pending = 0;
    for (const r of collectResults) {
      if (r.status !== "fulfilled") { pending++; continue; }
      if (r.value === "completed") completed++;
      else if (r.value === "failed") failed++;
      else pending++;
    }

    return NextResponse.json({ ok: true, submitted, completed, failed, pending });
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

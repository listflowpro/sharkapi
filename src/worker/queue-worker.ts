/**
 * Background queue worker — run standalone with:
 *   npm run worker
 *
 * Polls the DB for "queued" jobs and runs each through the provider pipeline
 * (processJobById → listflow.pro). Redis-INDEPENDENT: works even when the
 * Redis endpoint is down, so a dead queue can no longer stall the system.
 *
 * Each job is processed through processJobById, which keeps its own optimistic
 * lock (queued → processing) and idempotency check, so running more than one
 * worker — or overlapping polls — never double-charges or double-processes.
 * Errors are caught per-job; the worker loops forever and never crashes.
 */

// Load .env.local before anything else (Next.js convention, not loaded by Node)
import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch { /* .env.local not present — rely on process env */ }

import { createServiceClient } from "../lib/supabase/service";
import { processJobById } from "./job-processor";

const POLL_INTERVAL_MS = 2_000; // how often to look for new queued jobs
const BATCH_SIZE = 5;           // how many jobs to run concurrently per poll

async function fetchQueuedJobIds(): Promise<string[]> {
  const service = createServiceClient();
  const { data, error } = await service
    .from("jobs")
    .select("id")
    .eq("status", "queued")
    .order("queued_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error("[worker] fetch error:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.id as string);
}

async function run(): Promise<void> {
  console.log("[worker] DB-polling worker started — draining queued jobs to listflow.pro …");

  while (true) {
    let ids: string[] = [];
    try {
      ids = await fetchQueuedJobIds();
    } catch (err) {
      console.error("[worker] fetch exception:", (err as Error).message);
    }

    if (ids.length === 0) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }

    console.log(`[worker] picked up ${ids.length} queued job(s): ${ids.join(", ")}`);

    // processJobById owns the queued→processing optimistic lock, so running the
    // batch concurrently is safe (a job claimed elsewhere is simply skipped).
    await Promise.allSettled(
      ids.map(async (jobId) => {
        try {
          await processJobById(jobId);
        } catch (err) {
          // processJobById already marked the job failed in the DB.
          console.error(`[worker] job ${jobId} failed:`, (err as Error).message);
        }
      }),
    );
  }
}

run().catch((err) => {
  console.error("[worker] fatal error:", err);
  process.exit(1);
});

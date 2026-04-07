/**
 * Background queue worker — run standalone with:
 *   npm run worker
 *
 * Blocks on BRPOP, processes one job at a time, loops forever.
 * Errors are caught per-job so the worker never crashes.
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

import Redis from "ioredis";
import { processJobById } from "./job-processor";

const QUEUE_KEY = "sharkapi:jobs";
const BLOCK_TIMEOUT = 5; // seconds — 0 = block forever

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error("[worker] REDIS_URL is not set — exiting");
  process.exit(1);
}

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // required for blocking commands
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("connect",      () => console.log("[worker] connected to Redis"));
redis.on("error",  (err) => console.error("[worker] redis error:", err.message));
redis.on("close",        () => console.warn("[worker] redis connection closed"));

async function run(): Promise<void> {
  console.log(`[worker] listening on queue "${QUEUE_KEY}" …`);

  while (true) {
    let result: [string, string] | null = null;

    try {
      result = await redis.brpop(QUEUE_KEY, BLOCK_TIMEOUT);
    } catch (err) {
      console.error("[worker] brpop error:", (err as Error).message);
      // Brief pause to avoid tight error loop on persistent Redis issues
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if (!result) {
      // Timeout — nothing in queue, loop again
      continue;
    }

    const jobId = result[1];
    console.log(`[worker] dequeued job ${jobId}`);

    try {
      await processJobById(jobId);
    } catch (err) {
      // processJobById already marked the job as failed in DB
      console.error(`[worker] job ${jobId} failed:`, (err as Error).message);
    }
  }
}

run().catch((err) => {
  console.error("[worker] fatal error:", err);
  process.exit(1);
});

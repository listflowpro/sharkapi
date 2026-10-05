import { getRedisClient } from "./client";

export const QUEUE_KEY = "sharkapi:jobs";

/**
 * Push a job_id onto the queue.
 * If Redis is not configured, silently skips (manual worker remains as fallback).
 */
export async function enqueueJob(jobId: string): Promise<void> {
  // Best-effort fast-path only. The job is ALREADY persisted in the DB as
  // "queued" before this runs, so the worker still picks it up from the DB
  // even when Redis is unavailable.
  //
  // A Redis failure must NEVER crash the request. When the Redis endpoint went
  // down, an unhandled rejection here turned every POST /api/v1/image into an
  // empty-body HTTP 500 (the job row was created, but the caller got no job_id).
  try {
    const redis = getRedisClient();
    if (!redis) return; // Redis not configured — worker polls the DB instead
    await redis.lpush(QUEUE_KEY, jobId);
  } catch (err) {
    console.error(
      "[enqueue] redis push failed — job stays queued in DB for the worker:",
      (err as Error).message,
    );
  }
}

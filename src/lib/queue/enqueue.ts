import { getRedisClient } from "./client";

export const QUEUE_KEY = "sharkapi:jobs";

/**
 * Push a job_id onto the queue.
 * If Redis is not configured, silently skips (manual worker remains as fallback).
 */
export async function enqueueJob(jobId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return; // Redis not configured — fallback to manual worker
  await redis.lpush(QUEUE_KEY, jobId);
}

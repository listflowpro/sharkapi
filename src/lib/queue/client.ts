/**
 * Redis client singleton.
 * Server-side only — never import in client components.
 */

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Singleton — reused across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

export function getRedisClient(): Redis | null {
  if (!REDIS_URL) return null;

  if (globalThis.__redisClient) return globalThis.__redisClient;

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on("error", (err) => {
    // Log without exposing the URL (may contain credentials)
    console.error("[redis] connection error:", err.message);
  });

  globalThis.__redisClient = client;
  return client;
}

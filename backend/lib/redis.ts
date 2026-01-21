import { Redis } from "@upstash/redis";

/**
 * Redis Client Singleton
 * Uses Upstash Redis (HTTP-based) which is serverless friendly.
 *
 * Requires process.env.UPSTASH_REDIS_REST_URL and process.env.UPSTASH_REDIS_REST_TOKEN
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redisClient =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

if (!redisClient) {
  console.warn(
    "⚠️ Redis client not initialized: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN"
  );
}

export const redis = redisClient;

/**
 * Check if Redis is correctly configured and connected
 */
export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) return false;
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch (error) {
    console.error("❌ Redis health check failed:", error);
    return false;
  }
}

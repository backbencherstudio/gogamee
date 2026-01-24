import Redis from "ioredis";

/**
 * Redis Client Singleton
 * Uses ioredis for local/VPS Redis connection.
 *
 * Defaults to redis://localhost:6379 if REDIS_URL is not set.
 */

export const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Initialize Redis client
// maxRetriesPerRequest: null is required for BullMQ to avoid initial connection issues blocking workers
const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisClient.on("error", (err) => {
  // Suppress connection errors to avoid crashing the app if Redis is down momentarily,
  // but log them so we know what's happening.
  if ((err as any).code === "ECONNREFUSED") {
    // console.warn("⚠️ Redis connection refused. Is Redis running?"); // Optional: reduce noise
  } else {
    console.error("Redis Client Error:", err);
  }
});

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

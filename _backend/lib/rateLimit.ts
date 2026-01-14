import { redis } from "./redis";

/**
 * Rate Limiting Utility
 * Implements a simple Fixed Window algorithm for API rate limiting.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

/**
 * Check rate limit for a given identifier
 * @param identifier Unique identifier (e.g., IP address, user ID)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const reset = now + windowSeconds;

  // Fail open if Redis is not available
  if (!redis) {
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset,
    };
  }

  const key = `ratelimit:${identifier}`;

  try {
    // Use MULTI to perform atomic operations: INCR and EXPIRE
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);

    // Execute pipeline
    const results = await pipeline.exec<[number, number]>();

    // Extract count from results. Upstash returns [result, result]
    const count = results[0];

    const remaining = Math.max(0, limit - count);

    return {
      success: count <= limit,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.warn(`[RateLimit] Error checking limit for ${identifier}:`, error);
    // Fail open on error
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset,
    };
  }
}

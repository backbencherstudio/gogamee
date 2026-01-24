import { redis } from "./redis";

/**
 * Caching Utility
 * Provides a simple interface for caching data in Redis with TTL.
 * Fails gracefully (returns null/false) if Redis is unavailable.
 */

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Retrieve a value from cache
 * @param key Cache key
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`[Cache] Failed to get key ${key}:`, error);
    return null;
  }
}

/**
 * Set a value in cache with TTL
 * @param key Cache key
 * @param data Data to cache (must be serializable)
 * @param ttlSeconds Time to live in seconds (default: 300)
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = DEFAULT_TTL,
): Promise<void> {
  if (!redis) return;

  try {
    const stringifiedData = JSON.stringify(data);
    await redis.set(key, stringifiedData, "EX", ttlSeconds);
  } catch (error) {
    console.warn(`[Cache] Failed to set key ${key}:`, error);
  }
}

/**
 * Delete a value from cache
 * @param key Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Cache] Failed to delete key ${key}:`, error);
  }
}

/**
 * Clear multiple keys by pattern
 * WARNING: Use carefully in production. Uses SCAN/KEYS which can be slow.
 * For Upstash HTTP, it uses specialized commands.
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`[Cache] Failed to clear pattern ${pattern}:`, error);
  }
}

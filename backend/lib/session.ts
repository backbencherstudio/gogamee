import { redis } from "./redis";
import { randomUUID } from "crypto";

/**
 * Session Management Utility
 * Handles strict Redis-based sessions.
 */

// Default Session TTL: 7 days
const SESSION_TTL = 7 * 24 * 60 * 60;

export interface SessionData {
  userId: string;
  role: string;
  email: string;
  [key: string]: any;
}

/**
 * Create a new session
 * @param data Session data to store
 * @param ttlSeconds Optional custom TTL
 * @returns Session token
 */
export async function createSession(
  data: SessionData,
  ttlSeconds: number = SESSION_TTL,
): Promise<string> {
  if (!redis) throw new Error("Redis is required for session management");

  const token = randomUUID();
  const key = `session:${token}`;

  const stringifiedData = JSON.stringify(data);
  await redis.set(key, stringifiedData, "EX", ttlSeconds);

  return token;
}

/**
 * Retrieve session data
 * @param token Session token
 */
export async function getSession(token: string): Promise<SessionData | null> {
  if (!redis) return null;

  const key = `session:${token}`;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[Session] Failed to retrieve session ${token}:`, error);
    return null;
  }
}

/**
 * Refresh session TTL
 * @param token Session token
 * @param ttlSeconds New TTL
 */
export async function refreshSession(
  token: string,
  ttlSeconds: number = SESSION_TTL,
): Promise<boolean> {
  if (!redis) return false;

  const key = `session:${token}`;
  const exists = await redis.exists(key);

  if (exists) {
    await redis.expire(key, ttlSeconds);
    return true;
  }

  return false;
}

/**
 * Delete a session
 * @param token Session token
 */
export async function deleteSession(token: string): Promise<void> {
  if (!redis) return;

  const key = `session:${token}`;
  await redis.del(key);
}

import { readStore, updateStore, JsonStoreError } from "./jsonStore";
import { sessionStoreSchema, type Session } from "../schemas";

const SESSION_STORE_FILE = "sessions.json";

// In-memory session store for serverless environments
const inMemorySessions = new Map<string, Session>();

export async function appendSession(session: Session): Promise<void> {
  // Always store in memory first for fast access
  inMemorySessions.set(session.token, session);
  
  // Clean up expired sessions from memory
  const now = Date.now();
  for (const [token, s] of inMemorySessions.entries()) {
    if (new Date(s.expiresAt).getTime() <= now) {
      inMemorySessions.delete(token);
    }
  }

  // Try file-based storage, but don't fail if it's unavailable (serverless)
  try {
    await updateStore(SESSION_STORE_FILE, (current) => {
      const parsed = sessionStoreSchema.parse(current);
      const sessions = parsed.sessions.filter(
        (existing) => existing.token !== session.token
      );
      sessions.push(session);
      return {
        sessions,
        meta: {
          ...parsed.meta,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  } catch (error) {
    // Silently fallback to in-memory if file write fails (serverless environment)
    // This is expected in serverless environments like Vercel
  }
}

export async function removeSession(token: string): Promise<void> {
  // Always remove from memory
  inMemorySessions.delete(token);

  // Try file-based storage, but don't fail if it's unavailable
  try {
    await updateStore(SESSION_STORE_FILE, (current) => {
      const parsed = sessionStoreSchema.parse(current);
      const sessions = parsed.sessions.filter(
        (existing) => existing.token !== token
      );
      return {
        sessions,
        meta: {
          ...parsed.meta,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  } catch (error) {
    // Silently ignore file write failures (serverless environment)
  }
}

export async function findSessionByToken(token: string): Promise<Session | null> {
  // Always check in-memory first (fastest)
  const inMemorySession = inMemorySessions.get(token);
  if (inMemorySession) {
    // Check if expired
    if (new Date(inMemorySession.expiresAt).getTime() > Date.now()) {
      return inMemorySession;
    } else {
      inMemorySessions.delete(token);
      return null;
    }
  }

  // Try file-based storage as fallback
  try {
    const raw = await readStore(SESSION_STORE_FILE);
    const parsed = sessionStoreSchema.parse(raw);
    const session = parsed.sessions.find((entry) => entry.token === token);
    
    // Store in memory for faster access next time
    if (session && new Date(session.expiresAt).getTime() > Date.now()) {
      inMemorySessions.set(token, session);
      return session;
    }
    
    return null;
  } catch (error) {
    // File read failed (serverless or file doesn't exist) - return null
    if (error instanceof JsonStoreError) {
      return null;
    }
    // Re-throw unexpected errors
    throw error;
  }
}


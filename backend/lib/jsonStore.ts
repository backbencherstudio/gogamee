import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "backend", "data");
const LOCK_EXTENSION = ".lock";
const LOCK_RETRY_DELAY_MS = 20;
const LOCK_MAX_RETRIES = 250; // 5 seconds max wait

// In-memory storage as last resort
const inMemoryStore = new Map<string, unknown>();

// Lazy load Vercel KV
let kvClient: any = null;
let kvInitialized = false;

async function getKvClient() {
  if (kvInitialized) {
    return kvClient;
  }

  kvInitialized = true;

  // Check if we're in Vercel environment and KV is available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import("@vercel/kv");
      kvClient = kv;
      return kvClient;
    } catch (error) {
      console.warn("Vercel KV not available, using file system fallback");
      return null;
    }
  }

  return null;
}

class JsonStoreError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "JsonStoreError";
  }
}

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Ignore errors in serverless
  }
}

function resolvePath(fileName: string) {
  if (!fileName.endsWith(".json")) {
    throw new JsonStoreError(`JSON store "${fileName}" must use .json extension`);
  }
  return path.join(DATA_DIR, fileName);
}

function isNodeJsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function acquireLock(filePath: string) {
  const lockPath = `${filePath}${LOCK_EXTENSION}`;

  for (let attempt = 0; attempt < LOCK_MAX_RETRIES; attempt += 1) {
    try {
      const handle = await fs.open(lockPath, "wx");
      await handle.close();
      return lockPath;
    } catch (error: unknown) {
      if (!isNodeJsError(error) || error.code !== "EEXIST") {
        throw new JsonStoreError(`Failed to acquire lock for ${filePath}`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
    }
  }

  throw new JsonStoreError(`Timed out acquiring lock for ${filePath}`);
}

async function releaseLock(lockPath: string) {
  await fs.unlink(lockPath).catch((error: unknown) => {
    if (!isNodeJsError(error) || error.code !== "ENOENT") {
      console.warn(`Failed to release lock ${lockPath}`, error);
    }
  });
}

// Read from KV, file, or memory (in that order)
async function readJson<T>(fileName: string): Promise<T> {
  // 1. Try Vercel KV first (persistent, works in serverless)
  const kv = await getKvClient();
  if (kv) {
    try {
      const data = await kv.get(`jsonstore:${fileName}`) as T | null;
      if (data) {
        // Cache in memory for faster access
        inMemoryStore.set(fileName, data);
        return data;
      }
    } catch (error) {
      console.warn(`KV read failed for ${fileName}, trying file system`, error);
    }
  }

  // 2. Check in-memory cache
  if (inMemoryStore.has(fileName)) {
    return inMemoryStore.get(fileName) as T;
  }

  // 3. Try file system (for local development)
  try {
    await ensureDataDir();
    const filePath = resolvePath(fileName);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    
    // Cache in memory and KV
    inMemoryStore.set(fileName, parsed);
    if (kv) {
      try {
        await kv.set(`jsonstore:${fileName}`, parsed);
      } catch (error) {
        // Ignore KV write errors
      }
    }
    
    return parsed;
  } catch (error: unknown) {
    if (isNodeJsError(error) && error.code === "ENOENT") {
      throw new JsonStoreError(`JSON store not found: ${fileName}`);
    }
    throw new JsonStoreError(`Failed to read JSON store: ${fileName}`, error);
  }
}

// Write to KV, file, and memory
async function writeJson<T>(fileName: string, data: T): Promise<void> {
  // Always store in memory first (fastest)
  inMemoryStore.set(fileName, data);

  // 1. Try Vercel KV (persistent, works in serverless)
  const kv = await getKvClient();
  if (kv) {
    try {
      await kv.set(`jsonstore:${fileName}`, data);
      // Successfully stored in KV, we're done
      return;
    } catch (error) {
      console.warn(`KV write failed for ${fileName}, trying file system`, error);
    }
  }

  // 2. Try file system (for local development)
  try {
    await ensureDataDir();
    const filePath = resolvePath(fileName);
    const lockPath = await acquireLock(filePath);

    try {
      const serialized = JSON.stringify(data, null, 2);
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, serialized, "utf-8");
      await fs.rename(tempPath, filePath);
    } catch (error: unknown) {
      throw new JsonStoreError(`Failed to write JSON store: ${fileName}`, error);
    } finally {
      await releaseLock(lockPath);
    }
  } catch (error: unknown) {
    // File write failed, but we've stored in memory and possibly KV
    // This is acceptable in serverless environments
    if (!kv) {
      console.warn(`File write failed for ${fileName}, data stored in memory only`);
    }
  }
}

type StoreUpdater<T> = (current: T) => T | Promise<T>;

export async function readStore<T>(fileName: string): Promise<T> {
  return readJson<T>(fileName);
}

export async function writeStore<T>(fileName: string, data: T): Promise<void> {
  await writeJson<T>(fileName, data);
}

export async function updateStore<T>(
  fileName: string,
  updater: StoreUpdater<T>
): Promise<T> {
  // Get current data
  let current: T;
  
  try {
    current = await readJson<T>(fileName);
  } catch (error) {
    if (error instanceof JsonStoreError && error.message.includes("not found")) {
      throw error;
    }
    // If read fails, try to get from memory or create empty structure
    if (inMemoryStore.has(fileName)) {
      current = inMemoryStore.get(fileName) as T;
    } else {
      throw error;
    }
  }

  // Update the data
  const updated = await updater(current);
  
  // Write the updated data
  await writeJson<T>(fileName, updated);

  return updated;
}

export { JsonStoreError };

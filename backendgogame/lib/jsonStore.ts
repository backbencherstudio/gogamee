import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "backend", "data");
const LOCK_EXTENSION = ".lock";
const LOCK_RETRY_DELAY_MS = 20;
const LOCK_MAX_RETRIES = 250; // 5 seconds max wait

// In-memory storage as last resort
const inMemoryStore = new Map<string, unknown>();

// Lazy load Upstash Redis
let redisClient: Redis | null = null;
let redisInitialized = false;

async function getRedisClient() {
  if (redisInitialized) {
    return redisClient;
  }

  redisInitialized = true;

  // Check if Upstash Redis is available
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  console.log('🔍 Checking Upstash Redis configuration...');
  console.log(`   UPSTASH_REDIS_REST_URL: ${redisUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   UPSTASH_REDIS_REST_TOKEN: ${redisToken ? '✅ Set' : '❌ Missing'}`);
  
  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import("@upstash/redis");
      redisClient = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      
      // Test connection
      try {
        await redisClient.ping();
        console.log('✅ Upstash Redis connected successfully');
      } catch (pingError) {
        console.warn('⚠️ Upstash Redis ping failed, but client created', pingError);
      }
      
      return redisClient;
    } catch (error) {
      console.error("❌ Upstash Redis initialization failed:", error);
      console.warn("   Falling back to file system");
      return null;
    }
  } else {
    console.warn("⚠️ Upstash Redis environment variables not set, using file system fallback");
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

// Read from Redis, file, or memory (in that order)
async function readJson<T>(fileName: string): Promise<T> {
  // 1. Try Upstash Redis first (persistent, works in serverless, FREE)
  const redis = await getRedisClient();
  if (redis) {
    try {
      // Try with jsonstore: prefix first
      let data = await redis.get(`jsonstore:${fileName}`) as T | null;
      
      // If not found, try without prefix (in case data was stored directly)
      if (!data) {
        data = await redis.get(fileName) as T | null;
      }
      
      if (data) {
        // If data is a string, parse it
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data) as T;
          } catch (parseError) {
            console.warn(`Failed to parse Redis data for ${fileName}, using as-is`);
          }
        }
        
        // Always update in-memory cache with fresh data from Redis
        inMemoryStore.set(fileName, data);
        console.log(`✅ Read ${fileName} from Upstash Redis`);
        return data;
      } else {
        // Redis returned null, clear in-memory cache to force fresh read
        inMemoryStore.delete(fileName);
        console.log(`⚠️ No data found in Redis for ${fileName}, trying file system`);
      }
    } catch (error) {
      console.warn(`Redis read failed for ${fileName}, trying file system`, error);
      // On Redis error, clear in-memory cache to avoid stale data
      inMemoryStore.delete(fileName);
    }
  } else {
    console.log(`⚠️ Redis client not available for ${fileName}, using file system`);
  }

  // 2. Check in-memory cache (only if Redis is not available)
  if (!redis && inMemoryStore.has(fileName)) {
    return inMemoryStore.get(fileName) as T;
  }

  // 3. Try file system (for local development)
  try {
    await ensureDataDir();
    const filePath = resolvePath(fileName);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    
    // Cache in memory and Redis
    inMemoryStore.set(fileName, parsed);
    if (redis) {
      try {
        await redis.set(`jsonstore:${fileName}`, JSON.stringify(parsed));
      } catch (error) {
        // Ignore Redis write errors
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

// Write to Redis, file, and memory
async function writeJson<T>(fileName: string, data: T): Promise<void> {
  // 1. Try Upstash Redis first (persistent, works in serverless, FREE)
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`jsonstore:${fileName}`, JSON.stringify(data));
      // Successfully stored in Redis, now update in-memory cache
      inMemoryStore.set(fileName, data);
      return;
    } catch (error) {
      console.warn(`Redis write failed for ${fileName}, trying file system`, error);
    }
  }

  // Always store in memory (even if Redis write failed)
  inMemoryStore.set(fileName, data);

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
    // File write failed, but we've stored in memory and possibly Redis
    // This is acceptable in serverless environments
    if (!redis) {
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


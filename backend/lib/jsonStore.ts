import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "backend", "data");
const LOCK_EXTENSION = ".lock";
const LOCK_RETRY_DELAY_MS = 20;
const LOCK_MAX_RETRIES = 250; // 5 seconds max wait

// In-memory storage for serverless environments
const inMemoryStore = new Map<string, unknown>();

class JsonStoreError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "JsonStoreError";
  }
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
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

async function readJson<T>(fileName: string): Promise<T> {
  // Check in-memory first (for serverless)
  if (inMemoryStore.has(fileName)) {
    return inMemoryStore.get(fileName) as T;
  }

  await ensureDataDir();
  const filePath = resolvePath(fileName);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;
    // Cache in memory for faster access
    inMemoryStore.set(fileName, parsed);
    return parsed;
  } catch (error: unknown) {
    if (isNodeJsError(error) && error.code === "ENOENT") {
      throw new JsonStoreError(`JSON store not found: ${fileName}`);
    }
    throw new JsonStoreError(`Failed to read JSON store: ${fileName}`, error);
  }
}

async function writeJson<T>(fileName: string, data: T): Promise<void> {
  // Always store in memory first
  inMemoryStore.set(fileName, data);

  // Try file-based storage, but don't fail if unavailable (serverless)
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
      // If file write fails, we've already stored in memory, so continue
      throw new JsonStoreError(`Failed to write JSON store: ${fileName}`, error);
    } finally {
      await releaseLock(lockPath);
    }
  } catch (error: unknown) {
    // Silently fallback to in-memory storage (serverless environment)
    // This is expected in serverless environments like Vercel
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
  // Get current data (from memory or file)
  let current: T;
  
  // Check in-memory first
  if (inMemoryStore.has(fileName)) {
    current = inMemoryStore.get(fileName) as T;
  } else {
    // Try to read from file
    try {
      await ensureDataDir();
      const filePath = resolvePath(fileName);
      const raw = await fs.readFile(filePath, "utf-8");
      current = JSON.parse(raw) as T;
      // Cache in memory
      inMemoryStore.set(fileName, current);
    } catch (error: unknown) {
      if (isNodeJsError(error) && error.code === "ENOENT") {
        throw new JsonStoreError(`JSON store not found: ${fileName}`);
      }
      throw error;
    }
  }

  // Update the data
  const updated = await updater(current);
  
  // Always store in memory
  inMemoryStore.set(fileName, updated);

  // Try file-based storage, but don't fail if unavailable
  try {
    await ensureDataDir();
    const filePath = resolvePath(fileName);
    const lockPath = await acquireLock(filePath);

    try {
      const serialized = JSON.stringify(updated, null, 2);
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, serialized, "utf-8");
      await fs.rename(tempPath, filePath);
    } catch (error: unknown) {
      // File write failed, but we've stored in memory
      throw new JsonStoreError(`Failed to write JSON store: ${fileName}`, error);
    } finally {
      await releaseLock(lockPath);
    }
  } catch (error: unknown) {
    // Silently fallback to in-memory storage (serverless environment)
    // Data is already stored in memory, so operation succeeds
  }

  return updated;
}

export { JsonStoreError };


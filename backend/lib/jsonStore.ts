import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "backend", "data");
const LOCK_EXTENSION = ".lock";
const LOCK_RETRY_DELAY_MS = 20;
const LOCK_MAX_RETRIES = 250; // 5 seconds max wait

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
  await ensureDataDir();
  const filePath = resolvePath(fileName);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    if (isNodeJsError(error) && error.code === "ENOENT") {
      throw new JsonStoreError(`JSON store not found: ${fileName}`);
    }
    throw new JsonStoreError(`Failed to read JSON store: ${fileName}`, error);
  }
}

async function writeJson<T>(fileName: string, data: T): Promise<void> {
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
  await ensureDataDir();
  const filePath = resolvePath(fileName);
  const lockPath = await acquireLock(filePath);

  try {
    let current: T;
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      current = JSON.parse(raw) as T;
    } catch (error: unknown) {
      if (isNodeJsError(error) && error.code === "ENOENT") {
        throw new JsonStoreError(`JSON store not found: ${fileName}`);
      }
      throw error;
    }

    const updated = await updater(current);
    const serialized = JSON.stringify(updated, null, 2);
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, serialized, "utf-8");
    await fs.rename(tempPath, filePath);
    return updated;
  } catch (error: unknown) {
    throw new JsonStoreError(`Failed to update JSON store: ${fileName}`, error);
  } finally {
    await releaseLock(lockPath);
  }
}

export { JsonStoreError };


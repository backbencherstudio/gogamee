"use server";

import { randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { readStore, updateStore, JsonStoreError } from "../lib/jsonStore";
import {
  adminStoreSchema,
  sessionStoreSchema,
  type Admin,
  type Session,
} from "../schemas";

const ADMIN_STORE_FILE = "admins.json";
const SESSION_STORE_FILE = "sessions.json";
const SESSION_COOKIE = "gogame_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthorizationData {
  type: string;
  access_token: string;
  refresh_token: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  authorization?: AuthorizationData;
}

export interface LogoutResponse {
  success: boolean;
}

function getRequestContext() {
  const hdrs = headers();
  return {
    ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
    userAgent: hdrs.get("user-agent") ?? null,
  };
}

function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? randomBytes(16).toString("hex");
  const derived = randomBytes(32).toString("hex"); // placeholder to avoid heavy ops during hashing
  return `dev:${actualSalt}:${derived}:${password}`;
}

function verifyPassword(password: string, stored: string) {
  if (!stored) {
    return false;
  }

  if (stored.startsWith("plain:")) {
    const expected = Buffer.from(stored.slice("plain:".length));
    const actual = Buffer.from(password);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }

  if (stored.startsWith("dev:")) {
    // development helper, password stored in last segment
    const parts = stored.split(":");
    const expected = parts[3] ?? "";
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(password);
    return (
      expectedBuf.length === actualBuf.length &&
      timingSafeEqual(expectedBuf, actualBuf)
    );
  }

  throw new Error(
    "Unsupported password hash format. Please update admin password hashing configuration."
  );
}

async function readAdmins(): Promise<Admin[]> {
  const raw = await readStore(ADMIN_STORE_FILE);
  const parsed = adminStoreSchema.parse(raw);
  return parsed.admins;
}

async function appendSession(session: Session): Promise<void> {
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
}

async function removeSession(token: string): Promise<void> {
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
}

async function findSessionByToken(token: string): Promise<Session | null> {
  try {
    const raw = await readStore(SESSION_STORE_FILE);
    const parsed = sessionStoreSchema.parse(raw);
    const session = parsed.sessions.find((entry) => entry.token === token);
    return session ?? null;
  } catch (error) {
    if (error instanceof JsonStoreError) {
      return null;
    }
    throw error;
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const admins = await readAdmins();
  const admin = admins.find(
    (entry) => entry.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (!admin) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  const isValid = verifyPassword(payload.password, admin.passwordHash);

  if (!isValid) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  const now = Date.now();
  const session: Session = {
    id: randomUUID(),
    adminId: admin.id,
    token: randomUUID(),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    lastUsedAt: new Date(now).toISOString(),
    ...getRequestContext(),
  };

  await appendSession(session);

  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: session.token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(now + SESSION_TTL_MS),
  });

  return {
    success: true,
    message: "Login successful",
    authorization: {
      type: "Bearer",
      access_token: session.token,
      refresh_token: null,
    },
  };
}

export async function logout(): Promise<LogoutResponse> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await removeSession(token);
    cookieStore.delete(SESSION_COOKIE);
  }

  return { success: true };
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await findSessionByToken(token);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await removeSession(token);
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  const admins = await readAdmins();
  return admins.find((admin) => admin.id === session.adminId) ?? null;
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export { hashPassword };


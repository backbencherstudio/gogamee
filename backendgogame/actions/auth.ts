// import { randomBytes, randomUUID, timingSafeEqual } from "crypto";
// import { readStore, JsonStoreError } from "../lib/jsonStore";
// import {
//   adminStoreSchema,
//   type Admin,
//   type Session,
// } from "../schemas";
// import { appendSession, removeSession, findSessionByToken } from "../lib/sessionStore";

// const ADMIN_STORE_FILE = "admins.json";
// const SESSION_COOKIE = "gogame_admin_session";
// const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface AuthorizationData {
//   type: string;
//   access_token: string;
//   refresh_token: string | null;
// }

// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   authorization?: AuthorizationData;
//   sessionToken?: string; // Return token for API route to set cookie
// }

// export interface LogoutResponse {
//   success: boolean;
// }

// export interface RequestContext {
//   ipAddress: string | null;
//   userAgent: string | null;
// }

// function hashPassword(password: string, salt?: string) {
//   const actualSalt = salt ?? randomBytes(16).toString("hex");
//   const derived = randomBytes(32).toString("hex"); // placeholder to avoid heavy ops during hashing
//   return `dev:${actualSalt}:${derived}:${password}`;
// }

// function verifyPassword(password: string, stored: string) {
//   if (!stored) {
//     return false;
//   }

//   if (stored.startsWith("plain:")) {
//     const expected = Buffer.from(stored.slice("plain:".length));
//     const actual = Buffer.from(password);
//     return (
//       expected.length === actual.length && timingSafeEqual(expected, actual)
//     );
//   }

//   if (stored.startsWith("dev:")) {
//     // development helper, password stored in last segment
//     const parts = stored.split(":");
//     const expected = parts[3] ?? "";
//     const expectedBuf = Buffer.from(expected);
//     const actualBuf = Buffer.from(password);
//     return (
//       expectedBuf.length === actualBuf.length &&
//       timingSafeEqual(expectedBuf, actualBuf)
//     );
//   }

//   throw new Error(
//     "Unsupported password hash format. Please update admin password hashing configuration."
//   );
// }

// async function readAdmins(): Promise<Admin[]> {
//   const raw = await readStore(ADMIN_STORE_FILE);
//   const parsed = adminStoreSchema.parse(raw);
//   return parsed.admins;
// }

// export async function login(
//   payload: LoginPayload,
//   requestContext?: RequestContext
// ): Promise<LoginResponse> {
//   const admins = await readAdmins();
//   const admin = admins.find(
//     (entry) => entry.email.toLowerCase() === payload.email.toLowerCase()
//   );

//   if (!admin) {
//     return {
//       success: false,
//       message: "Invalid credentials",
//     };
//   }

//   const isValid = verifyPassword(payload.password, admin.passwordHash);

//   if (!isValid) {
//     return {
//       success: false,
//       message: "Invalid credentials",
//     };
//   }

//   const now = Date.now();
//   const context = requestContext || { ipAddress: null, userAgent: null };
//   const session: Session = {
//     id: randomUUID(),
//     adminId: admin.id,
//     token: randomUUID(),
//     createdAt: new Date(now).toISOString(),
//     expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
//     lastUsedAt: new Date(now).toISOString(),
//     ...context,
//   };

//   await appendSession(session);

//   return {
//     success: true,
//     message: "Login successful",
//     authorization: {
//       type: "Bearer",
//       access_token: session.token,
//       refresh_token: null,
//     },
//     sessionToken: session.token, // Return token for API route to set cookie
//   };
// }

// export async function logout(token?: string): Promise<LogoutResponse> {
//   if (token) {
//     await removeSession(token);
//   }

//   return { success: true };
// }

// export async function getCurrentAdmin(token?: string): Promise<Admin | null> {
//   if (!token) {
//     return null;
//   }

//   const session = await findSessionByToken(token);
//   if (!session) {
//     return null;
//   }

//   if (new Date(session.expiresAt).getTime() <= Date.now()) {
//     await removeSession(token);
//     return null;
//   }

//   const admins = await readAdmins();
//   return admins.find((admin) => admin.id === session.adminId) ?? null;
// }

// export async function requireAdmin(token?: string): Promise<Admin> {
//   const admin = await getCurrentAdmin(token);
//   if (!admin) {
//     throw new Error("Unauthorized");
//   }
//   return admin;
// }

// export { hashPassword };

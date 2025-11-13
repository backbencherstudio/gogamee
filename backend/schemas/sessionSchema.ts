import { z } from "zod";
import { metaSchema } from "./common";

export const sessionSchema = z.object({
  id: z.string(),
  adminId: z.string(),
  token: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  lastUsedAt: z.string().datetime(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
});

export const sessionStoreSchema = z.object({
  sessions: z.array(sessionSchema),
  meta: metaSchema,
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionStore = z.infer<typeof sessionStoreSchema>;


import { z } from "zod";
import { metaSchema } from "./common";

export const adminSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable().optional(),
  failedLoginAttempts: z.number().int().nonnegative().optional(),
});

export const adminStoreSchema = z.object({
  admins: z.array(adminSchema),
  meta: metaSchema,
});

export type Admin = z.infer<typeof adminSchema>;
export type AdminStore = z.infer<typeof adminStoreSchema>;


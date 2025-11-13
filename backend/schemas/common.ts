import { z } from "zod";

export const metaSchema = z.object({
  version: z.number().int().nonnegative(),
  updatedAt: z.string().datetime().nullable(),
});

export type Meta = z.infer<typeof metaSchema>;


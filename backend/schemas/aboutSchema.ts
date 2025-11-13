import { z } from "zod";
import { metaSchema } from "./common";

export const mainSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int().nonnegative(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const aboutItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int().nonnegative(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const aboutContentSchema = z.object({
  headline: z.string(),
  sections: z.array(mainSectionSchema),
  values: z.object({
    title: z.string(),
    items: z.array(aboutItemSchema),
  }),
  whyChooseUs: z.object({
    title: z.string(),
    items: z.array(aboutItemSchema),
  }),
  meta: metaSchema,
});

export type AboutContent = z.infer<typeof aboutContentSchema>;


import { z } from "zod";
import { metaSchema } from "./common";

export const testimonialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  image: z.string(),
  rating: z.number().int().min(1).max(5),
  review: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const testimonialStoreSchema = z.object({
  testimonials: z.array(testimonialItemSchema),
  meta: metaSchema,
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialStore = z.infer<typeof testimonialStoreSchema>;


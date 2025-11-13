import { z } from "zod";
import { metaSchema } from "./common";

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  sort_order: z.number().int().nonnegative(),
});

export const faqStoreSchema = z.object({
  faqs: z.array(faqItemSchema),
  meta: metaSchema,
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqStore = z.infer<typeof faqStoreSchema>;


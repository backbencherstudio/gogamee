import { z } from "zod";

// FAQ Create Schema
export const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required").trim(),
  answer: z.string().min(1, "Answer is required").trim(),
  sortOrder: z.number().int().default(0).optional(),
  category: z.string().trim().optional(),
  isActive: z.boolean().default(true).optional(),
});

// FAQ Update Schema
export const updateFAQSchema = z.object({
  question: z.string().min(1).trim().optional(),
  answer: z.string().min(1).trim().optional(),
  sortOrder: z.number().int().optional(),
  category: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

// FAQ Filter Schema
export const faqFilterSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Export types
export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;
export type FAQFilterInput = z.infer<typeof faqFilterSchema>;

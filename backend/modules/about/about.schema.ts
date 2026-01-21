import { z } from "zod";

// About Item Create Schema
export const createAboutItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  order: z.number().int().default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});

// About Item Update Schema
export const updateAboutItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// About Item Filter Schema
export const aboutItemFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Export types
export type CreateAboutItemInput = z.infer<typeof createAboutItemSchema>;
export type UpdateAboutItemInput = z.infer<typeof updateAboutItemSchema>;
export type AboutItemFilterInput = z.infer<typeof aboutItemFilterSchema>;

import { z } from "zod";

// Social Contact Create Schema
export const createSocialContactSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url("Invalid URL format"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
  order: z.number().int().default(0).optional(),
});

// Social Contact Update Schema
export const updateSocialContactSchema = z.object({
  platform: z.string().optional(),
  url: z.string().url().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

// Legal Page Create Schema
export const createLegalPageSchema = z.object({
  type: z.enum(["privacy", "terms", "cookie"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  version: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
  effectiveDate: z.date().optional(),
});

// Legal Page Update Schema
export const updateLegalPageSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  version: z.string().optional(),
  isActive: z.boolean().optional(),
  effectiveDate: z.date().optional(),
});

// Social Contact Filter Schema
export const socialContactFilterSchema = z.object({
  isActive: z.boolean().optional(),
  platform: z.string().optional(),
});

// Legal Page Filter Schema
export const legalPageFilterSchema = z.object({
  type: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const homepageStepSchema = z.object({
  title: z.string().min(1, "Step title is required").trim(),
  description: z.string().min(1, "Step description is required").trim(),
});

export const updateHomepageContentSchema = z.object({
  heroTitle: z.string().min(1, "Hero title is required").trim(),
  heroSubtitle: z.string().min(1, "Hero subtitle is required").trim(),
  howItWorksTitle: z.string().min(1, "Section title is required").trim(),
  howItWorksIntro: z.string().min(1, "Section intro is required").trim(),
  steps: z
    .array(homepageStepSchema)
    .length(4, "Homepage content must include exactly 4 steps"),
});

// Export types
export type CreateSocialContactInput = z.infer<
  typeof createSocialContactSchema
>;
export type UpdateSocialContactInput = z.infer<
  typeof updateSocialContactSchema
>;
export type CreateLegalPageInput = z.infer<typeof createLegalPageSchema>;
export type UpdateLegalPageInput = z.infer<typeof updateLegalPageSchema>;
export type SocialContactFilterInput = z.infer<
  typeof socialContactFilterSchema
>;
export type LegalPageFilterInput = z.infer<typeof legalPageFilterSchema>;
export type UpdateHomepageContentInput = z.infer<
  typeof updateHomepageContentSchema
>;

import { z } from "zod";

// Package Create Schema
export const createPackageSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  included: z.string().min(1, "Included field is required"),
  included_es: z.string().optional(),
  plan: z.enum(["standard", "premium", "combined"]),
  duration: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 night")
    .max(4, "Duration cannot exceed 4 nights"),
  description: z.string().min(1, "Description is required"),
  description_es: z.string().optional(),
  standardPrice: z.number().optional(),
  premiumPrice: z.number().optional(),
  currency: z.string().optional(),
  sortOrder: z.number().int().default(0).optional(),
});

// Package Update Schema
export const updatePackageSchema = z.object({
  sport: z.string().optional(),
  included: z.string().optional(),
  included_es: z.string().optional(),
  plan: z.enum(["standard", "premium", "combined"]).optional(),
  duration: z.number().int().min(1).max(4).optional(),
  description: z.string().optional(),
  description_es: z.string().optional(),
  standardPrice: z.number().optional(),
  premiumPrice: z.number().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// Package Filter Schema
export const packageFilterSchema = z.object({
  sport: z.string().optional(),
  included: z.string().optional(),
  plan: z.enum(["standard", "premium", "combined"]).optional(),
  duration: z.number().int().min(1).max(4).optional(),
  isActive: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

// Export types
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageFilterInput = z.infer<typeof packageFilterSchema>;

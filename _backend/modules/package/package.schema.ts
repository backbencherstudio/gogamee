import { z } from "zod";

// Package Create Schema
export const createPackageSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  category: z.string().min(1, "Category is required"),
  standard: z.string().min(1, "Standard description is required"),
  premium: z.string().min(1, "Premium description is required"),
  standardPrice: z.number().optional(),
  premiumPrice: z.number().optional(),
  currency: z.string().optional(),
  sortOrder: z.number().int().default(0).optional(),
});

// Package Update Schema
export const updatePackageSchema = z.object({
  sport: z.string().optional(),
  category: z.string().optional(),
  standard: z.string().optional(),
  premium: z.string().optional(),
  standardPrice: z.number().optional(),
  premiumPrice: z.number().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// Package Filter Schema
export const packageFilterSchema = z.object({
  sport: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

// Export types
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageFilterInput = z.infer<typeof packageFilterSchema>;

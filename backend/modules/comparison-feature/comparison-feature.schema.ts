import { z } from "zod";

const featureItemSchema = z.object({
  category: z.string().min(1),
  standard: z.string().min(1),
  premium: z.string().min(1),
  sortOrder: z.number().optional(),
});

export const createComparisonFeatureSchema = z.object({
  type: z.enum(["football", "basketball", "combined"]),
  features: z.array(featureItemSchema),
});

export const updateComparisonFeatureSchema = z.object({
  features: z.array(featureItemSchema),
  lastModifiedBy: z.string().optional(),
});

export type CreateComparisonFeatureInput = z.infer<typeof createComparisonFeatureSchema>;
export type UpdateComparisonFeatureInput = z.infer<typeof updateComparisonFeatureSchema>;

import { z } from "zod";

// Duration price schema
const durationPriceSchema = z.object({
  standard: z.number().min(0),
  premium: z.number().min(0),
});

// Starting Price Create Schema
export const createStartingPriceSchema = z.object({
  type: z.enum(["football", "basketball", "combined"]),
  currency: z.string().min(1, "Currency is required"),
  category: z.string().min(1, "Category is required"),
  standardDescription: z.string().min(1, "Standard description is required"),
  premiumDescription: z.string().min(1, "Premium description is required"),
  pricesByDuration: z.object({
    "1": durationPriceSchema,
    "2": durationPriceSchema,
    "3": durationPriceSchema,
    "4": durationPriceSchema,
  }),
});

// Starting Price Update Schema
export const updateStartingPriceSchema = z.object({
  currency: z.string().optional(),
  category: z.string().optional(),
  standardDescription: z.string().optional(),
  premiumDescription: z.string().optional(),
  pricesByDuration: z
    .object({
      "1": durationPriceSchema.optional(),
      "2": durationPriceSchema.optional(),
      "3": durationPriceSchema.optional(),
      "4": durationPriceSchema.optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
  lastModifiedBy: z.string().optional(),
});

// Export types
export type CreateStartingPriceInput = z.infer<
  typeof createStartingPriceSchema
>;
export type UpdateStartingPriceInput = z.infer<
  typeof updateStartingPriceSchema
>;

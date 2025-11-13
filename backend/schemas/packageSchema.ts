import { z } from "zod";
import { metaSchema } from "./common";

export const packageItemSchema = z.object({
  id: z.string(),
  sport: z.string(),
  category: z.string(),
  standard: z.string(),
  premium: z.string(),
  standardPrice: z.number().optional(),
  premiumPrice: z.number().optional(),
  currency: z.string().optional(),
});

export const packageStoreSchema = z.object({
  packages: z.array(packageItemSchema),
  meta: metaSchema,
});

const durationPriceSchema = z.object({
  standard: z.number(),
  premium: z.number(),
})

export const startingPriceItemSchema = z.object({
  id: z.string(),
  type: z.enum(["football", "basketball", "combined"]),
  currency: z.string(),
  standardDescription: z.string(),
  premiumDescription: z.string(),
  pricesByDuration: z.object({
    '1': durationPriceSchema,
    '2': durationPriceSchema,
    '3': durationPriceSchema,
    '4': durationPriceSchema,
  }),
  updatedAt: z.string().datetime(),
});

export const startingPriceStoreSchema = z.object({
  startingPrices: z.array(startingPriceItemSchema),
  meta: metaSchema,
});

export type PackageItem = z.infer<typeof packageItemSchema>;
export type PackageStore = z.infer<typeof packageStoreSchema>;
export type StartingPriceItem = z.infer<typeof startingPriceItemSchema>;
export type StartingPriceStore = z.infer<typeof startingPriceStoreSchema>;


import { z } from "zod";
import { metaSchema } from "./common";

const durationEnum = z.enum(["1", "2", "3", "4"]);

export const dateManagementItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  status: z.string(),
  football_standard_package_price: z.number(),
  football_premium_package_price: z.number(),
  baskatball_standard_package_price: z.number(),
  baskatball_premium_package_price: z.number(),
  updated_football_standard_package_price: z.number().nullable(),
  updated_football_premium_package_price: z.number().nullable(),
  updated_baskatball_standard_package_price: z.number().nullable(),
  updated_baskatball_premium_package_price: z.number().nullable(),
  package: z.string().nullable(),
  sportname: z.string(),
  league: z.string(),
  notes: z.string().nullable(),
  destinationCity: z.string().nullable(),
  assignedMatch: z.string().nullable(),
  approve_status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  duration: durationEnum.default("1"),
});

export const dateStoreSchema = z.object({
  dates: z.array(dateManagementItemSchema),
  meta: metaSchema,
});

export type DateManagementItem = z.infer<typeof dateManagementItemSchema>;
export type DateStore = z.infer<typeof dateStoreSchema>;

export type DateDuration = z.infer<typeof durationEnum>;


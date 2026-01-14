import { z } from "zod";

// Date Management Create Schema
export const createDateManagementSchema = z.object({
  date: z.string().min(1, "Date is required"),
  status: z.string().optional(),
  sportname: z.string().optional(),
  league: z.string().optional(),
  package: z.string().optional(),
  football_standard_package_price: z.number().optional(),
  football_premium_package_price: z.number().optional(),
  baskatball_standard_package_price: z.number().optional(),
  baskatball_premium_package_price: z.number().optional(),
  updated_football_standard_package_price: z.number().optional(),
  updated_football_premium_package_price: z.number().optional(),
  updated_baskatball_standard_package_price: z.number().optional(),
  updated_baskatball_premium_package_price: z.number().optional(),
  notes: z.string().optional(),
  destinationCity: z.string().optional(),
  assignedMatch: z.string().optional(),
  approve_status: z.string().optional(),
  duration: z.enum(["1", "2", "3", "4", "5"]).optional(),
});

// Date Management Update Schema
export const updateDateManagementSchema = z.object({
  status: z.string().optional(),
  sportname: z.string().optional(),
  league: z.string().optional(),
  package: z.string().optional(),
  football_standard_package_price: z.number().optional(),
  football_premium_package_price: z.number().optional(),
  baskatball_standard_package_price: z.number().optional(),
  baskatball_premium_package_price: z.number().optional(),
  updated_football_standard_package_price: z.number().optional(),
  updated_football_premium_package_price: z.number().optional(),
  updated_baskatball_standard_package_price: z.number().optional(),
  updated_baskatball_premium_package_price: z.number().optional(),
  notes: z.string().optional(),
  destinationCity: z.string().optional(),
  assignedMatch: z.string().optional(),
  approve_status: z.string().optional(),
  duration: z.enum(["1", "2", "3", "4", "5"]).optional(),
});

// Date Management Filter Schema
export const dateManagementFilterSchema = z.object({
  status: z.string().optional(),
  sportname: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  approve_status: z.string().optional(),
});

// Export types
export type CreateDateManagementInput = z.infer<
  typeof createDateManagementSchema
>;
export type UpdateDateManagementInput = z.infer<
  typeof updateDateManagementSchema
>;
export type DateManagementFilterInput = z.infer<
  typeof dateManagementFilterSchema
>;

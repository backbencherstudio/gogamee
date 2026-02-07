import { z } from "zod";

const priceStructureSchema = z.object({
  standard: z.number().min(0).default(0),
  premium: z.number().min(0).default(0),
});

// Date Management Create Schema
export const createDateManagementSchema = z.object({
  date: z.string().min(1, "Date is required"),
  status: z.string().optional(),
  duration: z.enum(["1", "2", "3", "4", "5"]).optional(),

  prices: z
    .object({
      football: priceStructureSchema,
      basketball: priceStructureSchema,
      combined: priceStructureSchema,
    })
    .optional(),

  notes: z.string().optional(),
  destinationCity: z.string().optional(),
  assignedMatch: z.string().optional(),
  approve_status: z.string().optional(),

  // Legacy fields allowed but optional
  sportname: z.string().optional(),
  league: z.string().optional(),
  package: z.string().optional(),
});

// Date Management Update Schema
export const updateDateManagementSchema = z.object({
  status: z.string().optional(),
  duration: z.enum(["1", "2", "3", "4", "5"]).optional(),

  prices: z
    .object({
      football: priceStructureSchema.partial().optional(),
      basketball: priceStructureSchema.partial().optional(),
      combined: priceStructureSchema.partial().optional(),
    })
    .partial()
    .optional(),

  notes: z.string().optional(),
  destinationCity: z.string().optional(),
  assignedMatch: z.string().optional(),
  approve_status: z.string().optional(),

  sportname: z.string().optional(),
  league: z.string().optional(),
  package: z.string().optional(),
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

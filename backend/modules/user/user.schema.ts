import { z } from "zod";

// User Create Schema
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.enum(["user", "guest"]).default("user"),
});

// User Update Schema
export const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["user", "guest"]).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  lastLogin: z.date().optional(),
});

// User Login Schema
export const loginCredentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// User Filter Schema
export const userFilterSchema = z.object({
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  search: z.string().optional(),
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;

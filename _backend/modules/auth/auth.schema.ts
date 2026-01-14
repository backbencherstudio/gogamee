import { z } from "zod";

// Admin Profile Schema
const adminProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

// Admin Create Schema
export const createAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin", "manager"]).default("admin"),
  permissions: z.array(z.string()).optional(),
  profile: adminProfileSchema,
});

// Admin Update Schema
export const updateAdminSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "admin", "manager"]).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  profile: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      avatar: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

// Admin Login Schema
export const loginCredentialsSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

// Admin Filter Schema
export const adminFilterSchema = z.object({
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Export types
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;
export type AdminFilterInput = z.infer<typeof adminFilterSchema>;

import { z } from "zod";

// Testimonial Create Schema
export const createTestimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  image: z.string().min(1, "Image is required"),
  rating: z.number().min(1).max(5),
  review: z.string().min(1, "Review is required"),
  source: z.string().optional(),
  metadata: z.any().optional(),
});

// Testimonial Update Schema
export const updateTestimonialSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  image: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  verified: z.boolean().optional(),
  source: z.string().optional(),
  metadata: z.any().optional(),
});

// Testimonial Filter Schema
export const testimonialFilterSchema = z.object({
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  source: z.string().optional(),
});

// Export types
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type TestimonialFilterInput = z.infer<typeof testimonialFilterSchema>;

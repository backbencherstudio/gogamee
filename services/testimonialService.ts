import axiosClient from "../lib/axiosClient";
import { createBaseService } from "./baseService";
import { ApiResponse } from "../app/lib/api-response";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  role_es?: string;
  rating: number;
  review: string;
  review_es?: string;
  created_at?: string;
  updated_at?: string;
}

// Initialize Base Service
const testimonialBase = createBaseService<TestimonialItem>("/testimonials");

// API Functions
export const getAllTestimonials = testimonialBase.getAll;
export const getTestimonialById = testimonialBase.getById;
export const addTestimonial = testimonialBase.create;
export const updateTestimonial = (id: string, payload: Partial<TestimonialItem>) => testimonialBase.updatePut(id, payload);
export const deleteTestimonial = testimonialBase.delete;

// Special functions that don't fit base CRUD
export interface TestimonialStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  };
}

export const getTestimonialStats = async (): Promise<TestimonialStatsResponse> => {
  const response = await axiosClient.get(`/testimonials/stats`);
  return response.data;
};

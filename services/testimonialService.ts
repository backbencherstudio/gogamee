import axiosClient from "../lib/axiosClient";

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
  deleted_at?: string | null;
}

export interface TestimonialListResponse {
  success: boolean;
  message: string;
  list: TestimonialItem[];
  totalCount?: number;
}

export interface TestimonialSingleResponse {
  success: boolean;
  message: string;
  data: TestimonialItem;
}

export interface CreateTestimonialPayload {
  name: string;
  role: string;
  rating: number;
  review: string;
}

export interface UpdateTestimonialPayload {
  name?: string;
  role?: string;
  rating?: number;
  review?: string;
}

import { ApiResponse } from "../app/lib/api-response";

// ... (existing interfaces)

// GET all
export const getAllTestimonials = async (
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<TestimonialItem[]>> => {
  const response = await axiosClient.get(
    `/testimonials?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// GET by id
export const getTestimonialById = async (
  id: string,
): Promise<TestimonialSingleResponse> => {
  const response = await axiosClient.get(`/testimonials/${id}`);
  return response.data;
};

// POST add
export const addTestimonial = async (
  payload: CreateTestimonialPayload,
): Promise<TestimonialSingleResponse> => {
  const response = await axiosClient.post("/testimonials", payload);
  return response.data;
};

// PUT update
export const updateTestimonial = async (
  id: string,
  payload: UpdateTestimonialPayload,
): Promise<TestimonialSingleResponse> => {
  const response = await axiosClient.put(`/testimonials/${id}`, payload);
  return response.data;
};

// DELETE
export const deleteTestimonial = async (
  id: string,
): Promise<TestimonialSingleResponse> => {
  const response = await axiosClient.delete(`/testimonials/${id}`);
  return response.data;
};

// GET stats
export interface TestimonialStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  };
}

export const getTestimonialStats =
  async (): Promise<TestimonialStatsResponse> => {
    const response = await axiosClient.get(`/testimonials/stats`);
    return response.data;
  };

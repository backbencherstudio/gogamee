import axiosClient from "../lib/axiosClient";

// ========== FAQ Interfaces ==========
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface FaqResponse {
  success: boolean;
  data: FaqItem[];
  message?: string;
}

export interface FaqPayload {
  question: string;
  answer: string;
  sort_order?: number;
}

export interface FaqUpdatePayload {
  question?: string;
  answer?: string;
  sort_order?: number;
}

// ========== FAQ API Functions ==========

import { ApiResponse } from "../app/lib/api-response";

// ... (existing interfaces)

// GET all FAQs
export const getAllFaqs = async (
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<FaqItem[]>> => {
  const response = await axiosClient.get(
    `/admin/faqs?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// POST add new FAQ
export const addFaq = async (payload: FaqPayload): Promise<FaqResponse> => {
  const response = await axiosClient.post("/admin/faqs", payload);
  return response.data;
};

// PATCH edit FAQ
export const editFaq = async (
  id: string,
  payload: FaqUpdatePayload,
): Promise<FaqResponse> => {
  const response = await axiosClient.patch(`/admin/faqs/${id}`, payload);
  return response.data;
};

// DELETE FAQ
export const deleteFaq = async (id: string): Promise<FaqResponse> => {
  const response = await axiosClient.delete(`/admin/faqs/${id}`);
  return response.data;
};

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
  list: FaqItem[];
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

// GET all FAQs
export const getAllFaqs = async (): Promise<FaqResponse> => {
  const response = await axiosClient.get("/admin/faq");
  return response.data;
};

// POST add new FAQ
export const addFaq = async (payload: FaqPayload): Promise<FaqResponse> => {
  const response = await axiosClient.post("/admin/faq", payload);
  return response.data;
};

// PATCH edit FAQ
export const editFaq = async (id: string, payload: FaqUpdatePayload): Promise<FaqResponse> => {
  const response = await axiosClient.patch(`/admin/faq/${id}`, payload);
  return response.data;
};

// DELETE FAQ
export const deleteFaq = async (id: string): Promise<FaqResponse> => {
  const response = await axiosClient.delete(`/admin/faq/${id}`);
  return response.data;
};


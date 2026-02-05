import axiosClient from "../lib/axiosClient";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  role_es?: string;
  image: string;
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
  imageFile?: File; // allow File or string URL
  rating: number;
  review: string;
}

export interface UpdateTestimonialPayload {
  name?: string;
  role?: string;
  image?: string | File; // allow File or string URL
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
  payload: CreateTestimonialPayload | FormData,
): Promise<TestimonialSingleResponse> => {
  let body: FormData;
  if (payload instanceof FormData) {
    body = payload;
  } else {
    body = new FormData();
    body.append("name", payload.name);
    body.append("role", payload.role);
    body.append("review", payload.review);
    body.append("rating", String(payload.rating));
    if (payload.imageFile instanceof File) {
      body.append("image", payload.imageFile);
    } else if (typeof payload.imageFile === "string" && payload.imageFile) {
      body.append("image", payload.imageFile);
    }
  }
  const response = await axiosClient.post("/testimonials", body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// PUT update
export const updateTestimonial = async (
  id: string,
  payload: UpdateTestimonialPayload | FormData,
): Promise<TestimonialSingleResponse> => {
  let body: FormData;
  if (payload instanceof FormData) {
    body = payload;
  } else {
    body = new FormData();
    if (payload.name !== undefined) body.append("name", payload.name);
    if (payload.role !== undefined) body.append("role", payload.role);
    if (payload.review !== undefined) body.append("review", payload.review);
    if (payload.rating !== undefined)
      body.append("rating", String(payload.rating));
    if (payload.image instanceof File) {
      body.append("image", payload.image);
    } else if (
      typeof payload.image === "string" &&
      payload.image !== undefined
    ) {
      body.append("image", payload.image);
    }
  }
  const response = await axiosClient.put(`/testimonials/${id}`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

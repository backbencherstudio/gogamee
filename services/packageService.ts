import axiosClient from "../lib/axiosClient";

// ========== Package Interfaces ==========
export interface PackageItem {
  id: string;
  sport: string;
  included: string;
  included_es?: string;
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  description: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

export interface PackageResponse {
  success: boolean;
  message: string;
  list?: PackageItem[];
  data?: any;
  count?: number;
  filter?: any;
}

export interface PackagePayload {
  sport: string;
  included: string;
  included_es?: string;
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  description: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

export interface PackageUpdatePayload {
  sport?: string;
  included?: string;
  included_es?: string;
  plan?: "standard" | "premium" | "combined";
  duration?: 1 | 2 | 3 | 4;
  description?: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

export interface SportsResponse {
  success: boolean;
  message: string;
  data: string[];
  count: number;
}

// ========== Package API Functions ==========

import { ApiResponse } from "../app/lib/api-response";

// GET all packages
export const getAllPackages = async (
  sport?: string,
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<PackageItem[]>> => {
  const params = { ...(sport ? { sport } : {}), page, limit };
  const response = await axiosClient.get("/packages/all-packages", { params });
  return response.data;
};

// GET package by ID
export const getPackageById = async (id: string): Promise<PackageResponse> => {
  const response = await axiosClient.get(`/packages/${id}`);
  return response.data;
};

// POST add new package
export const addPackage = async (
  payload: PackagePayload,
): Promise<PackageResponse> => {
  console.log("Package Service - Sending payload:", payload);
  const response = await axiosClient.post("/packages/add-product", payload);
  console.log("Package Service - Response received:", response.data);
  return response.data;
};

// PATCH edit package
export const editPackage = async (
  id: string,
  payload: PackageUpdatePayload,
): Promise<PackageResponse> => {
  const response = await axiosClient.patch(`/packages/${id}`, payload);
  return response.data;
};

// DELETE package
export const deletePackage = async (id: string): Promise<PackageResponse> => {
  const response = await axiosClient.delete(`/packages/${id}`);
  return response.data;
};

// GET all available sports for filtering
export const getAvailableSports = async (): Promise<SportsResponse> => {
  const response = await axiosClient.get("/packages/sports");
  return response.data;
};

// CHECK for duplicate packages
export interface CheckDuplicatePayload {
  sport: string;
  included: string;
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  excludeId?: string;
}

export interface CheckDuplicateResponse {
  success: boolean;
  exists: boolean;
  existingPackage?: {
    id: string;
    sport: string;
    included: string;
    plan: string;
    duration: number;
  };
}

export const checkDuplicatePackage = async (
  payload: CheckDuplicatePayload,
): Promise<CheckDuplicateResponse> => {
  const response = await axiosClient.post("/packages/check-duplicate", payload);
  return response.data;
};

// ========== Starting Price API (Single Source of Truth) ==========

export interface StartingPriceItem {
  id: string;
  type: "football" | "basketball" | "combined";
  category?: string;
  standardDescription?: string;
  premiumDescription?: string;
  currency: string; // e.g. 'euro' from API
  pricesByDuration: Record<
    "1" | "2" | "3" | "4",
    {
      standard: number;
      premium: number;
    }
  >;
  updatedAt: string;
}

export interface StartingPriceResponse {
  success: boolean;
  message: string;
  data: StartingPriceItem[];
}

export interface UpdateStartingPricePayload {
  category?: string;
  standardDescription?: string;
  premiumDescription?: string;
  currency: string; // API expects text like 'euro'
  pricesByDuration: Record<
    "1" | "2" | "3" | "4",
    {
      standard: number;
      premium: number;
    }
  >;
}

export const getStartingPrice = async (
  sport: "football" | "basketball" | "combined",
): Promise<StartingPriceResponse> => {
  const response = await axiosClient.get(`/packages/starting-price/${sport}`);
  return response.data;
};

export const updateStartingPrice = async (
  sport: "football" | "basketball" | "combined",
  payload: UpdateStartingPricePayload,
): Promise<PackageResponse> => {
  const response = await axiosClient.patch(
    `/packages/starting-price/${sport}`,
    payload,
  );
  return response.data;
};

import axiosClient from "../lib/axiosClient";

// ========== Package Interfaces ==========
export interface PackageItem {
  id: string;
  sport: string;
  category: string;
  standard: string;
  premium: string;
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
  category: string;
  standard: string;
  premium: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

export interface PackageUpdatePayload {
  sport?: string;
  category?: string;
  standard?: string;
  premium?: string;
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

// GET all packages
export const getAllPackages = async (sport?: string): Promise<PackageResponse> => {
  const params = sport ? { sport } : {};
  const response = await axiosClient.get("/api/package/all-packages", { params });
  return response.data;
};

// GET package by ID
export const getPackageById = async (id: string): Promise<PackageResponse> => {
  const response = await axiosClient.get(`/api/package/${id}`);
  return response.data;
};

// POST add new package
export const addPackage = async (payload: PackagePayload): Promise<PackageResponse> => {
  console.log('Package Service - Sending payload:', payload);
  const response = await axiosClient.post("/api/package/add-product", payload);
  console.log('Package Service - Response received:', response.data);
  return response.data;
};

// PATCH edit package
export const editPackage = async (id: string, payload: PackageUpdatePayload): Promise<PackageResponse> => {
  const response = await axiosClient.patch(`/api/package/${id}`, payload);
  return response.data;
};

// DELETE package
export const deletePackage = async (id: string): Promise<PackageResponse> => {
  const response = await axiosClient.delete(`/api/package/${id}`);
  return response.data;
};

// GET all available sports for filtering
export const getAvailableSports = async (): Promise<SportsResponse> => {
  const response = await axiosClient.get("/api/package/sports");
  return response.data;
};

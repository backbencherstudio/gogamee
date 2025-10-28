import axiosClient from "../lib/axiosClient";

// ========== Date Management Interfaces ==========
export interface DateManagementItem {
  id: string;
  date: string;
  status: string;
  football_standard_package_price: number;
  football_premium_package_price: number;
  baskatball_standard_package_price: number;
  baskatball_premium_package_price: number;
  updated_football_standard_package_price: number | null;
  updated_football_premium_package_price: number | null;
  updated_baskatball_standard_package_price: number | null;
  updated_baskatball_premium_package_price: number | null;
  package: string | null;
  sportname: string;
  league: string;
  notes: string | null;
  destinationCity: string | null;
  assignedMatch: string | null;
  approve_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateDatePayload {
  date: string;
  status?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number;
  updated_football_premium_package_price?: number;
  updated_baskatball_standard_package_price?: number;
  updated_baskatball_premium_package_price?: number;
  package?: string;
  sportname?: string;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
}

export interface UpdateDatePayload {
  sportname?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number;
  updated_football_premium_package_price?: number;
  updated_baskatball_standard_package_price?: number;
  updated_baskatball_premium_package_price?: number;
  package?: string;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  status?: string;
  approve_status?: string;
}

// ========== Date Management API Functions ==========

// GET all dates
export const getAllDates = async (): Promise<DateManagementItem[]> => {
  console.log('Date Management Service - Fetching all dates');
  const response = await axiosClient.get("/api/admin/date-management");
  console.log('Date Management Service - Dates received:', response.data);
  return response.data;
};

// POST create new date
export const createDate = async (payload: CreateDatePayload): Promise<DateManagementItem> => {
  console.log('Date Management Service - Creating date with payload:', payload);
  const response = await axiosClient.post("/api/admin/date-management", payload);
  console.log('Date Management Service - Date created:', response.data);
  return response.data;
};

// PATCH update date (for price editing)
export const updateDate = async (id: string, payload: UpdateDatePayload): Promise<DateManagementItem> => {
  console.log('Date Management Service - Updating date:', id, 'with data:', payload);
  const response = await axiosClient.patch(`/api/admin/date-management/${id}`, payload);
  console.log('Date Management Service - Date updated:', response.data);
  return response.data;
};

// DELETE date (if needed)
export const deleteDate = async (id: string): Promise<void> => {
  console.log('Date Management Service - Deleting date:', id);
  await axiosClient.delete(`/api/admin/date-management/${id}`);
  console.log('Date Management Service - Date deleted');
};

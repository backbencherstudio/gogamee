import axiosClient from "../lib/axiosClient";

// ========== Date Management Interfaces ==========
export interface DateManagementItem {
  id: string;
  date: string;
  // Flattened prices structure from API
  prices?: {
    standard: number;
    premium: number;
    combined?: number;
  };
  sportName: string; // Changed from sportname to match API
  league: string;
  duration?: "1" | "2" | "3" | "4";

  // Optional metadata if needed
  months?: string[];
  year?: number;
  created_at: string;
  updated_at: string;

  // Legacy/Frontend specific fields that might still be needed or can be derived
  status?: string;
  notes?: string | null;
  destinationCity?: string | null;
  assignedMatch?: string | null;
  approve_status?: string;
}

export interface CreateDatePayload {
  date: string;
  status?: string;
  prices?: {
    standard: number;
    premium: number;
  };
  customPrices?: any; // For flexible payload
  sportName?: string;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  duration?: "1" | "2" | "3" | "4";
}

export interface UpdateDatePayload {
  sportName?: string;
  prices?: {
    standard: number;
    premium: number;
  };
  customPrices?: any;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  status?: string;
  approve_status?: string;
  duration?: "1" | "2" | "3" | "4";
}

// ========== Date Management API Functions ==========

// GET all dates with optimizations
export const getAllDates = async (filters: {
  months: string[];
  year: number;
  sportName: string;
  league: string;
  duration: string;
}): Promise<DateManagementItem[]> => {
  // Returns direct array now
  console.log(
    "Date Management Service - Fetching dates with filters:",
    filters,
  );

  const params = new URLSearchParams();
  if (filters.months?.length) params.append("months", filters.months.join(","));
  if (filters.year) params.append("year", filters.year.toString());
  if (filters.sportName) params.append("sport", filters.sportName);
  if (filters.league) params.append("league", filters.league);
  if (filters.duration) params.append("duration", filters.duration);

  const response = await axiosClient.get(
    `/admin/date-management?${params.toString()}`,
  );

  console.log(
    "Date Management Service - Dates received:",
    Array.isArray(response.data) ? response.data.length : 0,
  );

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

// POST create new date
export const createDate = async (
  payload: CreateDatePayload,
): Promise<DateManagementItem> => {
  console.log("Date Management Service - Creating date with payload:", payload);
  const response = await axiosClient.post("/admin/date-management", payload);
  console.log("Date Management Service - Date created:", response.data);
  return response.data;
};

// PATCH update date (for price editing)
export const updateDate = async (
  id: string,
  payload: UpdateDatePayload,
): Promise<DateManagementItem> => {
  console.log(
    "Date Management Service - Updating date:",
    id,
    "with data:",
    payload,
  );
  const response = await axiosClient.patch(
    `/admin/date-management/${id}`,
    payload,
  );
  console.log("Date Management Service - Date updated:", response.data);
  return response.data;
};

// DELETE date (if needed)
export const deleteDate = async (
  id: string,
  payload?: { sportName: string },
): Promise<void> => {
  console.log("Date Management Service - Deleting date:", id, payload);
  await axiosClient.delete(`/admin/date-management/${id}`, {
    data: payload,
  });
  console.log("Date Management Service - Date deleted");
};

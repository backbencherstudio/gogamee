import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "@/app/lib/api-response";

// ========== Date Management Interfaces ==========
export interface DateManagementItem {
  id: string;
  date: string;
  prices?: {
    standard: number;
    premium: number;
    combined?: number;
  };
  sportName: string;
  league: string;
  duration?: "1" | "2" | "3" | "4";
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface CreateDatePayload {
  date: string;
  status?: string;
  prices?: { standard: number; premium: number };
  sportName?: string;
  league?: string;
  duration?: "1" | "2" | "3" | "4";
}

export interface UpdateDatePayload {
  sportName?: string;
  prices?: { standard: number; premium: number };
  status?: string;
}

// ========== Date Management API Functions ==========

export const getAllDates = async (filters: {
  months: string[];
  year: number;
  sportName: string;
  league: string;
  duration: string;
}): Promise<ApiResponse<DateManagementItem[]>> => {
  const params = new URLSearchParams();
  if (filters.months?.length) params.append("months", filters.months.join(","));
  if (filters.year) params.append("year", filters.year.toString());
  if (filters.sportName) params.append("sport", filters.sportName);
  if (filters.league) params.append("league", filters.league);
  if (filters.duration) params.append("duration", filters.duration);

  const response = await axiosClient.get(`/admin/date-management?${params.toString()}`);
  return response.data;
};

export const createDate = async (payload: CreateDatePayload): Promise<any> => {
  const response = await axiosClient.post("/admin/date-management", payload);
  return response.data;
};

export const updateDate = async (id: string, payload: UpdateDatePayload): Promise<any> => {
  const response = await axiosClient.patch(`/admin/date-management/${id}`, payload);
  return response.data;
};

export const deleteDate = async (id: string, payload?: { sportName: string }): Promise<void> => {
  await axiosClient.delete(`/admin/date-management/${id}`, { data: payload });
};

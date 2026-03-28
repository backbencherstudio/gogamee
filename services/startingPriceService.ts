import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "@/app/lib/api-response";

export const getStartingPriceBySport = async (sport: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.get(`/packages/starting-price/${sport}`);
  return response.data;
};

export const updateStartingPrice = async (type: string, data: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post(`/admin/starting-price/${type}`, data);
  return response.data;
};

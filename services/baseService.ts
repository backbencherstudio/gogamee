import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "../app/lib/api-response";

/**
 * A generic base service to handle common CRUD operations.
 * Reduces boilerplate across different feature services.
 */

export const createBaseService = <T, P = Partial<T>>(baseUrl: string) => {
  return {
    getAll: async (page: number = 1, limit: number = 10): Promise<ApiResponse<T[]>> => {
      const response = await axiosClient.get(`${baseUrl}?page=${page}&limit=${limit}`);
      return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<T>> => {
      const response = await axiosClient.get(`${baseUrl}/${id}`);
      return response.data;
    },

    create: async (payload: P): Promise<ApiResponse<T>> => {
      const response = await axiosClient.post(baseUrl, payload);
      return response.data;
    },

    update: async (id: string, payload: P): Promise<ApiResponse<T>> => {
      const response = await axiosClient.patch(`${baseUrl}/${id}`, payload);
      return response.data;
    },

    // Some endpoints use PUT for updates
    updatePut: async (id: string, payload: P): Promise<ApiResponse<T>> => {
      const response = await axiosClient.put(`${baseUrl}/${id}`, payload);
      return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<T>> => {
      const response = await axiosClient.delete(`${baseUrl}/${id}`);
      return response.data;
    },
  };
};

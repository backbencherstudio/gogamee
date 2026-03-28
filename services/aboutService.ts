import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "@/app/lib/api-response";

/**
 * About Management Service
 * Standardized functions for About Page content management
 */

// Core fetch function
export const getAboutManagement = async (): Promise<ApiResponse<any>> => {
  const response = await axiosClient.get("/admin/about/content");
  return response.data;
};

// Headline
export const updateAboutHeadline = async (title: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post("/admin/about/headline", { title });
  return response.data;
};

// Generic Section handlers (Shared across sections, values, whyChooseUs)
// Frontend differentiates by calling specific functions, we map them to the same backend logic
// but with correct 'type' in the payload if needed, or unique URLs

// 1. Main Sections
export const addMainSection = async (payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post("/admin/about/main_sections", { ...payload, type: "main_section" });
  return response.data;
};

export const editMainSection = async (id: string, payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.patch(`/admin/about/main_sections/${id}`, { ...payload, type: "main_section" });
  return response.data;
};

export const deleteMainSection = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.delete(`/admin/about/main_sections/${id}`);
  return response.data;
};

// 2. Our Values
export const addOurValue = async (payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post("/admin/about/our_values", { ...payload, type: "our_value" });
  return response.data;
};

export const editOurValue = async (id: string, payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.patch(`/admin/about/our_values/${id}`, { ...payload, type: "our_value" });
  return response.data;
};

export const deleteOurValue = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.delete(`/admin/about/our_values/${id}`);
  return response.data;
};

// 3. Why Choose Us
export const addWhyChooseUs = async (payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post("/admin/about/why_choose_us", { ...payload, type: "why_choose_us" });
  return response.data;
};

export const editWhyChooseUs = async (id: string, payload: any): Promise<ApiResponse<any>> => {
  const response = await axiosClient.patch(`/admin/about/why_choose_us/${id}`, { ...payload, type: "why_choose_us" });
  return response.data;
};

export const deleteWhyChooseUs = async (id: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.delete(`/admin/about/why_choose_us/${id}`);
  return response.data;
};

// Export Types for compatibility
export type MainSection = any;
export type OurValue = any;
export type WhyChooseUs = any;
export type AboutContent = any;
export type MainSectionPayload = any;
export type OurValuePayload = any;
export type WhyChooseUsPayload = any;
export type MainSectionUpdatePayload = any;
export type OurValueUpdatePayload = any;
export type WhyChooseUsUpdatePayload = any;

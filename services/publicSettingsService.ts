import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "@/app/lib/api-response";

export interface PublicLegalPagesResponse extends ApiResponse<any> {
  content?: any;
}

export const getPublicLegalPages = async (
  type?: string,
): Promise<PublicLegalPagesResponse> => {
  const response = await axiosClient.get(`/legal-pages${type ? `?page=${type}` : ""}`);
  return response.data;
};

export const getLegalPageContent = getPublicLegalPages;

export const getSocialLinks = async (): Promise<ApiResponse<any>> => {
  const response = await axiosClient.get("/social-contact");
  return response.data;
};

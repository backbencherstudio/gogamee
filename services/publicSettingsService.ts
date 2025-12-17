import axiosClient from "../lib/axiosClient";

// ========== Public Legal Pages Interfaces ==========
export interface LegalPageResponse {
  success: boolean;
  message?: string;
  content?: string | {
    privacy: { en: string; es: string };
    cookie: { en: string; es: string };
    terms: { en: string; es: string };
  };
}

// ========== Public Legal Pages API Functions ==========

// GET legal page content (public, no auth required)
export const getLegalPageContent = async (
  page: "privacy" | "cookie" | "terms",
  lang: "en" | "es" = "es"
): Promise<LegalPageResponse> => {
  const response = await axiosClient.get(
    `/legal-pages?page=${page}&lang=${lang}`
  );
  return response.data;
};

// GET all legal pages content
export const getAllLegalPages = async (): Promise<LegalPageResponse> => {
  const response = await axiosClient.get("/legal-pages");
  return response.data;
};

// ========== Social Media & Contact Links ==========

export interface SocialContactLinks {
  whatsapp: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  email: string;
}

export interface SocialContactResponse {
  success: boolean;
  message?: string;
  links?: SocialContactLinks;
}

// GET social contact links (public, no auth required)
export const getSocialContactLinks = async (): Promise<SocialContactResponse> => {
  const response = await axiosClient.get("/social-contact");
  return response.data;
};


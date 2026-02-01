import axiosClient from "../lib/axiosClient";

// ========== Social Media & Contact Links Interfaces ==========
export interface SocialContactLinks {
  whatsapp: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  email: string;
}

export interface SocialContactResponse {
  success: boolean;
  message: string;
  links?: SocialContactLinks;
}

// ========== Legal Pages Interfaces ==========
export type LegalPageContent = string;

export interface LegalPagesContent {
  privacy: string;
  cookie: string;
  terms: string;
}

export interface LegalPagesResponse {
  success: boolean;
  message: string;
  content?: LegalPagesContent;
}

// ========== Social Media & Contact Links API Functions ==========

// GET social contact links
export const getSocialContactLinks =
  async (): Promise<SocialContactResponse> => {
    const response = await axiosClient.get("/admin/settings/social-contact");
    return response.data;
  };

// PUT update social contact links
export const updateSocialContactLinks = async (
  links: Partial<SocialContactLinks>,
): Promise<SocialContactResponse> => {
  const response = await axiosClient.put(
    "/admin/settings/social-contact",
    links,
  );
  return response.data;
};

// ========== Legal Pages API Functions ==========

// GET all legal pages content
export const getLegalPages = async (): Promise<LegalPagesResponse> => {
  const response = await axiosClient.get("/admin/settings/legal");
  return response.data;
};

// PUT update privacy policy
export const updatePrivacyPolicy = async (
  content: LegalPageContent,
): Promise<LegalPagesResponse> => {
  const response = await axiosClient.put("/admin/settings/legal/privacy", {
    content,
  });
  return response.data;
};

// PUT update cookie policy
export const updateCookiePolicy = async (
  content: LegalPageContent,
): Promise<LegalPagesResponse> => {
  const response = await axiosClient.put("/admin/settings/legal/cookie", {
    content,
  });
  return response.data;
};

// PUT update terms and conditions
export const updateTermsConditions = async (
  content: LegalPageContent,
): Promise<LegalPagesResponse> => {
  const response = await axiosClient.put("/admin/settings/legal/terms", {
    content,
  });
  return response.data;
};

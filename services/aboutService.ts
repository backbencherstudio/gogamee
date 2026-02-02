import axiosClient from "../lib/axiosClient";

// ========== About Management Interfaces ==========
export interface MainSection {
  id: string;
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OurValue {
  id: string;
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WhyChooseUs {
  id: string;
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AboutContent {
  headline: string;
  sections: MainSection[];
  values: {
    title: string;
    items: OurValue[];
  };
  whyChooseUs: {
    title: string;
    items: WhyChooseUs[];
  };
}

export interface AboutResponse {
  success: boolean;
  message: string;
  data: AboutContent | { item: any; content: AboutContent };
  meta_data?: any;
}

// ========== Payload Interfaces ==========
export interface MainSectionPayload {
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order?: number;
}

export interface OurValuePayload {
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order?: number;
}

export interface WhyChooseUsPayload {
  title: string;
  title_es?: string;
  description: string;
  description_es?: string;
  order?: number;
}

export interface MainSectionUpdatePayload {
  title?: string;
  title_es?: string;
  description?: string;
  description_es?: string;
  order?: number;
}

export interface OurValueUpdatePayload {
  title?: string;
  title_es?: string;
  description?: string;
  description_es?: string;
  order?: number;
}

export interface WhyChooseUsUpdatePayload {
  title?: string;
  title_es?: string;
  description?: string;
  description_es?: string;
  order?: number;
}

// ========== About Management API Functions ==========

// GET all about management data
export const getAboutManagement = async (): Promise<AboutResponse> => {
  const response = await axiosClient.get("/admin/about/main_sections");
  return response.data;
};

// PUT update headline
export const updateAboutHeadline = async (
  headline: string,
): Promise<AboutResponse> => {
  const response = await axiosClient.put("/admin/about/main_sections", {
    headline,
  });
  return response.data;
};

// ========== Main Sections API ==========

// GET main sections
export const getMainSections = async (): Promise<AboutResponse> => {
  const response = await axiosClient.get("/admin/about/main_sections");
  return response.data;
};

// POST add new main section
export const addMainSection = async (
  payload: MainSectionPayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.post(
    "/admin/about/main_sections",
    payload,
  );
  return response.data;
};

// PUT edit main section
export const editMainSection = async (
  id: string,
  payload: MainSectionUpdatePayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.put(
    `/admin/about/main_sections/${id}`,
    payload,
  );
  return response.data;
};

// DELETE main section
export const deleteMainSection = async (id: string): Promise<AboutResponse> => {
  const response = await axiosClient.delete(`/admin/about/main_sections/${id}`);
  return response.data;
};

// ========== Our Values API ==========

// POST add new our value
export const addOurValue = async (
  payload: OurValuePayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.post("/admin/about/our_values", payload);
  return response.data;
};

// PUT edit our value
export const editOurValue = async (
  id: string,
  payload: OurValueUpdatePayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.put(
    `/admin/about/our_values/${id}`,
    payload,
  );
  return response.data;
};

// DELETE our value
export const deleteOurValue = async (id: string): Promise<AboutResponse> => {
  const response = await axiosClient.delete(`/admin/about/our_values/${id}`);
  return response.data;
};

// ========== Why Choose Us API ==========

// POST add new why choose us
export const addWhyChooseUs = async (
  payload: WhyChooseUsPayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.post(
    "/admin/about/why_choose_us",
    payload,
  );
  return response.data;
};

// PUT edit why choose us
export const editWhyChooseUs = async (
  id: string,
  payload: WhyChooseUsUpdatePayload,
): Promise<AboutResponse> => {
  const response = await axiosClient.put(
    `/admin/about/why_choose_us/${id}`,
    payload,
  );
  return response.data;
};

// DELETE why choose us
export const deleteWhyChooseUs = async (id: string): Promise<AboutResponse> => {
  const response = await axiosClient.delete(`/admin/about/why_choose_us/${id}`);
  return response.data;
};

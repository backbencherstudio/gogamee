export interface UpdateAboutSectionData {
  type?: "headline" | "main_section" | "our_values" | "why_choose_us";
  title?: string;
  description?: string;
  values?: {
    title: string;
    description: string;
    order: number;
  }[];
  order?: number;
  isActive?: boolean;
}

export interface CreateAboutSectionData {
  type: "headline" | "main_section" | "our_values" | "why_choose_us";
  title: string;
  description: string;
  values?: {
    title: string;
    description: string;
    order: number;
  }[];
  order?: number;
  isActive?: boolean;
}

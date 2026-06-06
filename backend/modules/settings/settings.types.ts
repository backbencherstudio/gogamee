export interface CreateSocialContactData {
  platform: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateSocialContactData {
  platform?: string;
  url?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateLegalPageData {
  type: "privacy" | "terms" | "cookie";
  title: string;
  content: string;
  version?: string;
  isActive?: boolean;
  effectiveDate?: Date;
}

export interface UpdateLegalPageData {
  title?: string;
  content?: string;
  version?: string;
  isActive?: boolean;
  effectiveDate?: Date;
}

export interface SocialContactFilters {
  isActive?: boolean;
  platform?: string;
}

export interface LegalPageFilters {
  type?: string;
  isActive?: boolean;
}

export interface SettingsQueryOptions {
  filters?: SocialContactFilters | LegalPageFilters;
  sort?: {
    field: "createdAt" | "order" | "type";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
}

export interface HomepageStepContent {
  title: string;
  description: string;
}

export interface HomepageContentData {
  heroTitle: string;
  heroSubtitle: string;
  howItWorksTitle: string;
  howItWorksIntro: string;
  steps: HomepageStepContent[];
}

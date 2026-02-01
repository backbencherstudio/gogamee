// FAQ Service Types

export interface CreateFAQData {
  question: string;
  answer: string;
  sortOrder?: number;
  category?: string;
  isActive?: boolean;
}

export interface UpdateFAQData {
  question?: string;
  answer?: string;
  sortOrder?: number;
  category?: string;
  isActive?: boolean;
}

export interface FAQFilters {
  category?: string;
  isActive?: boolean;
}

export interface FAQQueryOptions {
  filters?: FAQFilters;
  sort?: {
    field: "sortOrder" | "createdAt";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
  page?: number;
}

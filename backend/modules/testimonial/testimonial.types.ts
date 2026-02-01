export interface CreateTestimonialData {
  name: string;
  role: string;
  image: string;
  rating: number;
  review: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTestimonialData {
  name?: string;
  role?: string;
  image?: string;
  rating?: number;
  review?: string;
  isActive?: boolean;
  featured?: boolean;
  sortOrder?: number;
  verified?: boolean;
  source?: string;
  metadata?: Record<string, any>;
}

export interface TestimonialFilters {
  isActive?: boolean;
  featured?: boolean;
  verified?: boolean;
  minRating?: number;
  maxRating?: number;
  source?: string;
}

export interface TestimonialQueryOptions {
  filters?: TestimonialFilters;
  sort?: {
    field: "createdAt" | "rating" | "sortOrder";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
  page?: number;
}

export interface CreatePackageData {
  sport: string;
  included: string;
  included_es?: string;
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  description: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
  sortOrder?: number;
}

export interface UpdatePackageData {
  sport?: string;
  included?: string;
  included_es?: string;
  plan?: "standard" | "premium" | "combined";
  duration?: 1 | 2 | 3 | 4;
  description?: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PackageFilters {
  sport?: string;
  included?: string;
  plan?: "standard" | "premium" | "combined";
  duration?: 1 | 2 | 3 | 4;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PackageQueryOptions {
  filters?: PackageFilters;
  sort?: {
    field: "createdAt" | "sortOrder" | "sport" | "category";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
  page?: number;
}

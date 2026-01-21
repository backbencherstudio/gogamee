export interface CreatePackageData {
  sport: string;
  category: string;
  standard: string;
  premium: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
  sortOrder?: number;
}

export interface UpdatePackageData {
  sport?: string;
  category?: string;
  standard?: string;
  premium?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PackageFilters {
  sport?: string;
  category?: string;
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
}

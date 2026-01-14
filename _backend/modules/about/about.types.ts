export interface CreateAboutItemData {
  title: string;
  description: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateAboutItemData {
  title?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface AboutItemFilters {
  isActive?: boolean;
  search?: string;
}

export interface AboutQueryOptions {
  filters?: AboutItemFilters;
  sort?: {
    field: "createdAt" | "order";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "user" | "guest";
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  role?: "user" | "guest";
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: Date;
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  search?: string;
}

export interface UserQueryOptions {
  filters?: UserFilters;
  sort?: {
    field: "createdAt" | "lastLogin" | "name";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
}

import { IUser } from "../../models";

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  role?: "super_admin" | "admin" | "manager";
  permissions?: string[];
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface UpdateAdminData {
  username?: string;
  email?: string;
  role?: "super_admin" | "admin" | "manager";
  isActive?: boolean;
  permissions?: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
  };
}

export interface AdminLoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  admin: Partial<IUser>;
}

export interface AdminFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface AdminQueryOptions {
  filters?: AdminFilters;
  sort?: {
    field: "createdAt" | "lastLogin" | "username";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
}

import axiosClient from "../lib/axiosClient";

// ========== Auth Interfaces ==========
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthorizationData {
  type: string;
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  authorization?: AuthorizationData;
  type?: string;
}

// ========== Auth API Functions ==========

// POST login
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  console.log('Auth Service - Sending login payload:', { email: payload.email });
  const response = await axiosClient.post("/api/auth/login", payload);
  console.log('Auth Service - Login response received:', response.data);
  
  // Store token in localStorage if login successful
  if (response.data.success && response.data.authorization?.access_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.authorization.access_token);
      console.log('Token stored in localStorage');
    }
  }
  
  return response.data;
};

// Logout function
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  }
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};


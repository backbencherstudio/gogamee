import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// *** axios instance ***
const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// *** Request Interceptor ***

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = 
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);



// *** Response Interceptor ***

axiosClient.interceptors.response.use(
    (response) => {
        return response;
        return response;
    },
    (error) => {
        console.error("API Error:", {
            url: error?.config?.url,
            method: error?.config?.method,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default axiosClient;
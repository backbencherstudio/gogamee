import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// *** axios instance ***
const axiosClient: AxiosInstance = axios.create({
    baseURL: "/api",
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
        
        // Log request details for debugging
        console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            data: config.data
        });
        
        return config;
    },
    (error) => Promise.reject(error)
);



// *** Response Interceptor ***

axiosClient.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
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
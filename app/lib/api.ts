// lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // ⬅️ jodi cookie based auth thake
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor (e.g. auth token)
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add response interceptor (e.g. error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here (401, 403, etc.)
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
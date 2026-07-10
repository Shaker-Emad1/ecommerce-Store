import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// Relative "/api" works in production (nginx proxies /api → backend:5000) and in
// development (Vite dev-server proxy forwards /api → http://localhost:5262).
// Override with VITE_API_URL when a different backend host is needed.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT Token Helper Functions
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const clearToken = (): void => {
  localStorage.removeItem("token");
};

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // If unauthorized, clear token and maybe trigger reload or page change
      if (error.response.status === 401) {
        clearToken();
      }
      
      // Extract error message
      const data = error.response.data as any;
      const message = data?.message || data?.errors || error.message || "حدث خطأ ما";
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error(error.message || "لا يمكن الاتصال بالخادم"));
  }
);

export default api;

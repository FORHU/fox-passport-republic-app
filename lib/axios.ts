// src/lib/axios.ts
import axios from "axios";
import { config } from "@/lib/config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for token in localStorage
    const token = localStorage.getItem("fox_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token.replace(/"/g, "")}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("fox_refresh_token");
        if (!refreshToken) throw new Error("No refresh token available");

        console.log("[Axios] Token expired, attempting silent refresh...");

        // Use base axios to avoid interceptor loop
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh-token`, {
          refreshToken: refreshToken.replace(/"/g, '')
        });

        const { accessToken, user } = data;
        
        // Save new token
        localStorage.setItem("fox_token", accessToken);
        
        // Update user object (including embedded token for legacy compatibility)
        if (user) {
          const storedUser = { ...user, accessToken };
          localStorage.setItem("fox_user", JSON.stringify(storedUser));
        }
        
        // Update Authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("[Axios] Silent refresh failed:", refreshError);
        // Clear auth data and redirect to landing if refresh fails
        localStorage.removeItem("fox_token");
        localStorage.removeItem("fox_refresh_token");
        localStorage.removeItem("fox_user");
        
        if (typeof window !== "undefined") {
          window.location.href = "/?auth=expired";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

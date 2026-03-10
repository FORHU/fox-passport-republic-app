// src/lib/axios.ts
import axios from "axios";
import { config } from "@/lib/config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // check for a dedicated token entry first, since we save it separately
    const explicitToken = localStorage.getItem("fox_token");
    if (explicitToken) {
      config.headers.Authorization = `Bearer ${explicitToken}`;
      console.log("[Axios] Authorization header set from fox_token");
      return config;
    }

    // fallback to inspecting the stored user object (legacy/compat)
    const stored = localStorage.getItem("fox_user");
    console.log("[Axios] fox_user from localStorage:", stored ? "exists" : "NOT FOUND");
    
    if (stored) {
      try {
        const session = JSON.parse(stored);
        console.log("[Axios] Parsed session keys:", Object.keys(session));
        
        // Try multiple possible token field names
        const token =
          session.accessToken ||
          session.token ||
          session.authToken ||
          (explicitToken || null); // already handled above but keep for clarity
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("[Axios] Authorization header set");
        } else {
          console.warn("[Axios] No token found in session. Keys:", Object.keys(session));
        }
      } catch (error) {
        console.error("[Axios] Error parsing auth token", error);
      }
    } else {
      console.warn("[Axios] No fox_user found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

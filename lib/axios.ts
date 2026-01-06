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
    // access persisted state in localStorage
    const stored = localStorage.getItem("fox_user");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        if (session.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing auth token", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

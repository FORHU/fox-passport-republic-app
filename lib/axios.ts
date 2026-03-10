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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

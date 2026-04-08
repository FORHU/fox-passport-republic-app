"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAdminData = (type: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-data", type],
    queryFn: async () => {
      // Don't fetch if it's just the dashboard
      if (type === "dashboard") return [];

      try {
        let endpoint = "";
        switch (type) {
          case "venues":
            endpoint = "/venues";
            break;
          case "events":
            endpoint = "/events";
            break;
          case "categories":
            endpoint = "/categories";
            break;
          case "citizens":
            endpoint = "/users";
            break;
          default:
            return [];
        }

        const res = await api.get(endpoint);
        // Robust unwrapping: check common keys and array fallbacks
        const raw = 
          res.data?.data?.users ?? 
          res.data?.data ?? 
          res.data?.users ?? 
          res.data?.citizens ?? 
          res.data?.venues ?? 
          res.data?.events ?? 
          res.data?.categories ?? 
          res.data?.results ?? 
          (Array.isArray(res.data) ? res.data : []);
        
        return Array.isArray(raw) ? raw : [];
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
        return [];
      }
    },
    enabled: type !== "dashboard",
  });

  return {
    data: data || [],
    isLoading,
    refetch,
  };
};

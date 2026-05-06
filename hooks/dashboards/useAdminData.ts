"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAdminData = (type: string, initialData?: any) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-data", type],
    queryFn: async () => {
      // Don't fetch if it's just the dashboard
      if (type === "dashboard") return [];

      try {
        let endpoint = "";
        switch (type) {
          case "venues":
            endpoint = "/admin/venues/pending";
            break;
          case "assets":
            endpoint = "/admin/assets"; // We updated this to show all for admin in previous turn
            break;
          case "services":
            endpoint = "/admin/services"; // We updated this to show all for admin in previous turn
            break;
          case "events":
            endpoint = "/admin/events";
            break;
          case "categories":
            endpoint = "/categories";
            break;
          case "citizens":
            endpoint = "/users";
            break;
          case "stats":
            endpoint = "/admin/stats";
            break;
          case "bookings":
            endpoint = "/admin/bookings"; // Assuming this exists or works with standard list
            break;
          default:
            return [];
        }

        const res = await api.get(endpoint);
        const raw = 
          res.data?.data?.users ?? 
          res.data?.data ?? 
          res.data?.users ?? 
          res.data?.citizens ?? 
          res.data?.venues ?? 
          res.data?.events ?? 
          res.data?.categories ?? 
          res.data?.results ?? 
          res.data?.stats ?? 
          (Array.isArray(res.data) ? res.data : res.data?.data ?? []);
        
        return raw;
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
        return [];
      }
    },
    enabled: type !== "dashboard",
    initialData,
    refetchInterval: (query) => {
      // Only poll if tab is active to save resources
      if (typeof document !== 'undefined' && document.hidden) return false;
      return 5000; // 5 seconds
    },
    refetchOnWindowFocus: true,
    staleTime: 1000, // Data becomes stale after 1 second to allow polling
  });

  return {
    data: data || [],
    isLoading: isLoading && !data, // Only loading if we don't have cached data
    refetch,
  };
};

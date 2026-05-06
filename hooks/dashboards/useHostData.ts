"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useHostData = (type: 'services' | 'assets' | 'events' | 'venues', initialData?: any[]) => {
  const user = useAuthStore(s => s.user);
  const userId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["host-data", type, userId],
    queryFn: async () => {
      if (!userId) return [];
      
      let endpoint = "";
      let params: any = {};
      
      switch (type) {
        case "services":
          endpoint = "/service";
          params = { ownerId: String(userId) };
          break;
        case "assets":
          endpoint = "/asset";
          params = { ownerId: String(userId) };
          break;
        case "events":
          endpoint = "/event-templates";
          params = { ownerId: String(userId) };
          break;
        case "venues":
          endpoint = "/venues";
          params = { hostId: String(userId) };
          break;
        default:
          return [];
      }

      const res = await api.get(endpoint, { params });
      const raw = res.data?.data ?? res.data?.services ?? res.data?.assets ?? res.data?.venues ?? res.data?.eventTemplates ?? (Array.isArray(res.data) ? res.data : []);
      return Array.isArray(raw) ? raw : [];
    },
    enabled: !!userId,
    initialData,
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.hidden) return false;
      return 10000; // 10 seconds
    },
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  return {
    data: data || [],
    isLoading: isLoading && !data,
  };
};

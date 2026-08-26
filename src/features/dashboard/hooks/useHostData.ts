"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface UseHostDataOptions {
  page?: number;
  limit?: number;
  /**
   * Pass false to keep the query idle. The host dashboard renders a
   * LockedSection instead of the real one when the user lacks the role, but
   * mounted this hook either way - so a venue-only Foxer polled events, assets
   * and services every 10 seconds purely to render them into a locked section
   * as an empty list.
   */
  enabled?: boolean;
}

export const useHostData = (
  type: "services" | "assets" | "events" | "venues",
  initialData?: unknown[],
  options?: UseHostDataOptions,
) => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 50;

  const { data, isLoading } = useQuery({
    queryKey: ["host-data", type, userId, page, limit],
    queryFn: async () => {
      if (!userId) return { items: [], total: 0 };

      let endpoint = "";
      let params: Record<string, string> = {};

      switch (type) {
        case "services":
          endpoint = "/service";
          params = {
            ownerId: String(userId),
            page: String(page),
            limit: String(limit),
          };
          break;
        case "assets":
          endpoint = "/asset";
          params = {
            ownerId: String(userId),
            page: String(page),
            limit: String(limit),
          };
          break;
        case "events":
          endpoint = "/event-templates";
          params = {
            ownerId: String(userId),
            page: String(page),
            limit: String(limit),
          };
          break;
        case "venues":
          endpoint = "/venues";
          params = {
            hostId: String(userId),
            page: String(page),
            limit: String(limit),
          };
          break;
        default:
          return { items: [], total: 0 };
      }

      const res = await api.get(endpoint, { params });
      const raw =
        res.data?.templates ??
        res.data?.data ??
        res.data?.services ??
        res.data?.assets ??
        res.data?.venues ??
        res.data?.eventTemplates ??
        (Array.isArray(res.data) ? res.data : []);
      const total: number =
        res.data?.total ?? (Array.isArray(raw) ? raw.length : 0);
      return { items: Array.isArray(raw) ? raw : [], total };
    },
    enabled: !!userId && (options?.enabled ?? true),
    initialData:
      page === 1 && initialData
        ? { items: initialData, total: initialData.length }
        : undefined,
    refetchInterval: () => {
      if (typeof document !== "undefined" && document.hidden) return false;
      return 10000;
    },
    refetchOnWindowFocus: true,
    // The page number is part of the query key, so paging is a cache miss.
    // Without this the list blanks on every page change; keeping the previous
    // page visible while the next loads is the difference between a flicker
    // and a flash of empty state.
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading: isLoading && !data,
  };
};

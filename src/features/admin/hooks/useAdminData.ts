"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import {
  pollWhileVisible,
  SOCKET_FALLBACK_POLL_MS,
} from "@/shared/lib/realtime";

/**
 * @param enabled  Pass false to keep the query idle. AdminContent mounts one of
 *   these per admin tab but renders only the active one, so without this every
 *   tab polls in the background - including the seven the user cannot see.
 */
export const useAdminData = (
  type: string,
  initialData?: any,
  enabled = true,
) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-data", type],
    queryFn: async () => {
      // Don't fetch if it's just the dashboard
      if (type === "dashboard") return [];

      try {
        let endpoint = "";
        switch (type) {
          case "venues":
            endpoint = "/admin/venues";
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
            const [serviceBody, assetBody, eventBody] = await Promise.all([
              api.get("/service/bookings"),
              api.get("/asset/bookings"),
              api.get("/bookings"),
            ]);
            const extractList = (body: any) =>
              body.data?.data?.venues ??
              body.data?.data ??
              body.data?.venues ??
              body.data?.events ??
              body.data?.results ??
              (Array.isArray(body.data) ? body.data : (body.data?.data ?? []));
            return {
              serviceBookings: extractList(serviceBody),
              assetBookings: extractList(assetBody),
              eventBookings: extractList(eventBody),
            };
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
          (Array.isArray(res.data) ? res.data : (res.data?.data ?? []));

        return raw;
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
        return [];
      }
    },
    enabled: enabled && type !== "dashboard",
    initialData,
    refetchInterval: pollWhileVisible,
    refetchOnWindowFocus: true,
    // Matches the poll interval. At 1s the server-rendered initialData was
    // already stale by the time the client mounted, so every page load and tab
    // switch fired an immediate refetch for data it had just been handed.
    staleTime: SOCKET_FALLBACK_POLL_MS,
  });

  return {
    data: data || [],
    isLoading: isLoading && !data, // Only loading if we don't have cached data
    refetch,
  };
};

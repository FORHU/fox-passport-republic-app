"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAdminDashboard = () => {
  const {
    data: stats = { totalUsers: 0, totalRevenue: 0, activeEvents: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data.data;
    },
  });

  return {
    loading: isLoading,
    stats,
    error: error instanceof Error ? error.message : null,
  };
};

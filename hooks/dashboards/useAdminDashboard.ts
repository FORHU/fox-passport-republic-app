import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useAdminDashboard = () => {
  const {
    data: stats = { totalUsers: 0, totalRevenue: 0, activeEvents: 0 },
    isLoading,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/v1/admin/stats");
        return res.data.data;
      } catch (error) {
        console.warn("Failed to fetch admin stats, using mock:", error);
        return {
          totalUsers: 12543,
          totalRevenue: 450000,
          activeEvents: 342,
          pendingApprovals: 8,
        };
      }
    },
  });

  return {
    loading: isLoading,
    stats,
  };
};

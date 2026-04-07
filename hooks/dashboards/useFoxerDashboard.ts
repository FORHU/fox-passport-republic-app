"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/ui/useScrollReveal";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const useFoxerDashboard = () => {
  useScrollReveal();
  // In the future this will manage tabs and data fetching
  const {
    data: stats = { totalBookings: 0, totalRevenue: 0, rating: 5.0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["foxer-stats"],
    queryFn: async () => {
      const res = await api.get("/v1/foxers/me/stats");
      return res.data.data;
    },
  });
  const [activeTab, setActiveTab] = useState("overview");

  return {
    activeTab,
    setActiveTab,
    stats,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
};

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCreateVenueModal } from "@/hooks/venues/useCreateVenueModal";
import { useAuthActions, useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

interface Venue {
  id: string;
  title: string; // The UI expects 'title', backend might provide 'name'
  name: string;
  status: string;
  rating: number;
  // Add other fields as needed
}

export const useHostDashboard = () => {
  const router = useRouter();
  const { openModal } = useCreateVenueModal();
  const { logout } = useAuthActions();
  const user = useAuthStore((state) => state.user);
  // User object in store: generic Record<string, unknown> or specific type?
  // Based on useAuthStore.ts, it's Record<string, unknown> | null.
  // We need to cast or access property safely.
  // Assuming user object has 'id' or 'userId' property.
  // Let's check how it's stored. Usually it's userData.
  const userId = user?.id;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["host-venues", userId],
    queryFn: async () => {
      if (!userId) return [];
      // Calling GET /api/venues?hostId=...
      const response = await api.get(`/venues?hostId=${userId}`);
      // Backend returns { success: true, data: [...] }
      return response.data.data;
    },
    enabled: !!userId, // Only run query if we have a user ID
  });

  const stats = {
    totalVenues: venues.length,
    activeListings: venues.filter((v: Venue) => v.status === "active").length, // Adjust 'active' based on enum
    totalRevenue: 0, // Placeholder
    averageRating:
      venues.length > 0
        ? venues.reduce((acc: number, v: Venue) => acc + (v.rating || 0), 0) /
          venues.length
        : 0.0,
  };

  return {
    handleLogout,
    openModal,
    stats,
    isLoading,
  };
};

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCreateVenueModal } from "@/features/venue/hooks/useCreateVenueModal";
import {
  useAuthActions,
  useAuthStore,
} from "@/features/auth/store/useAuthStore";
import api from "@/shared/lib/axios";

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

  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ["host-venues", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/venues?hostId=${userId}`);
      return response.data.venues ?? [];
    },
    enabled: !!userId,
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.hidden) return false;
      return 10000;
    },
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const { data: ownerStats, isLoading: statsLoading } = useQuery({
    queryKey: ["host-venue-stats", userId],
    queryFn: async () => {
      const response = await api.get('/venues/owner-stats');
      return response.data as {
        totalVenues: number;
        activeListings: number;
        averageRating: number;
        totalRevenue: number;
      };
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  const stats = ownerStats ?? {
    totalVenues: venues.length,
    activeListings: venues.filter((v: Venue) => v.status === "available").length,
    averageRating: 0,
    totalRevenue: 0,
  };

  return {
    handleLogout,
    openModal,
    stats,
    isLoading: venuesLoading || statsLoading,
  };
};

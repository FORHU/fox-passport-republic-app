"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";

interface VenueStats {
  totalVenues: number;
  activeListings: number;
  totalRevenue: number;
  averageRating: number;
}

interface Venue {
  id: string;
  name: string;
  description: string;
  venueType: string;
  status: string;
  isPublished: boolean;
  city: string;
  createdAt: string;
}

const fetchHostVenues = async (
  hostId: string,
  token?: string | null,
): Promise<Venue[]> => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/venues?hostId=${hostId}`,
    { headers },
  );
  return response.data.venues || [];
};

const fetchOwnerStats = async (token?: string | null): Promise<VenueStats> => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/venues/owner-stats`,
    { headers },
  );
  return response.data.data;
};

const FALLBACK_STATS: VenueStats = {
  totalVenues: 0,
  activeListings: 0,
  totalRevenue: 0,
  averageRating: 0,
};

export const useHostVenues = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hostId = user?.id as string | undefined;

  const {
    data: venues = [],
    isLoading: venuesLoading,
    error: venuesError,
    refetch,
  } = useQuery({
    queryKey: ["hostVenues", hostId],
    queryFn: () => fetchHostVenues(hostId!, accessToken),
    enabled: !!hostId,
    staleTime: 30000,
  });

  const { data: stats = FALLBACK_STATS, isLoading: statsLoading } = useQuery({
    queryKey: ["hostVenueStats"],
    queryFn: () => fetchOwnerStats(accessToken),
    enabled: !!accessToken,
    staleTime: 60000,
  });

  return {
    venues,
    stats,
    isLoading: venuesLoading || statsLoading,
    error: venuesError,
    refetch,
  };
};

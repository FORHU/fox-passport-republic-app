"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

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
  // Add other venue fields as needed
}

// Fetch venues for a specific host
const fetchHostVenues = async (hostId: string, token?: string | null): Promise<Venue[]> => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/venues?hostId=${hostId}`,
    { headers }
  );

  // Backend now returns { venues } instead of { success, data }
  return response.data.venues || [];
};

// Calculate stats from venues
const calculateStats = (venues: Venue[]): VenueStats => {
  const totalVenues = venues.length;
  const activeListings = venues.filter(
    (v) => v.status === "active" && v.isPublished
  ).length;

  // TODO: Calculate from actual booking/payment data
  const totalRevenue = 0;
  const averageRating = 0.0;

  return {
    totalVenues,
    activeListings,
    totalRevenue,
    averageRating,
  };
};

export const useHostVenues = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hostId = user?.id as string | undefined;

  const { data: venues = [], isLoading, error, refetch } = useQuery({
    queryKey: ["hostVenues", hostId],
    queryFn: () => fetchHostVenues(hostId!, accessToken),
    enabled: !!hostId, // Only run query if hostId exists
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const stats = calculateStats(venues);

  return {
    venues,
    stats,
    isLoading,
    error,
    refetch,
  };
};

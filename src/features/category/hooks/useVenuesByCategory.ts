"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "@/shared/lib/config";

interface VenueImage {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
}

interface VenuePricing {
  id: string;
  pricePerDay: number;
  pricePerHour?: number;
  currency: string;
}

interface VenueHost {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
}

interface VenueCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  venueType: string;
  capacity?: number;
  status: string;
  isPublished: boolean;
  address: string;
  city: string;
  state: string;
  country: string;
  host: VenueHost;
  category: VenueCategory | null;
  pricing: VenuePricing[];
  images: VenueImage[];
  _count?: {
    reviews: number;
    events: number;
  };
}

interface VenuesResponse {
  success: boolean;
  data: Venue[];
  count: number;
}

const fetchVenuesByCategory = async (categoryName: string | null): Promise<Venue[]> => {
  if (!categoryName) return [];

  // Convert category name to slug (lowercase, replace spaces with hyphens)
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "");

  const response = await axios.get(
    `${config.apiUrl}/venues/category/${categorySlug}`
  );

  return response.data.venues || response.data.data || [];
};

export function useVenuesByCategory(categoryName: string | null) {
  const {
    data: venues = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["venues-by-category", categoryName],
    queryFn: () => fetchVenuesByCategory(categoryName),
    enabled: !!categoryName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    venues,
    loading,
    error: error ? (error as Error).message : null,
  };
}

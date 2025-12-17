// src/hooks/useRecentActivity.ts
"use client";

import { useState, useEffect, useCallback } from "react";
// Import the REAL data source
import { HARDCODED_VENUES, Venue } from "@/src/data/hardcodedVenues";

// Define the shape your UI expects
export interface ActivityData {
  id: string;
  user: {
    name: string;
    image: string; // avatar
    action: string;
    time: string;
  };
  business: {
    name: string;
    image?: string;
    rating: number;
    category: string;
    location: string;
    details: string;
  };
  content: {
    text?: string;
    images?: string[];
  };
  reviews: any[]; 
}

const ITEMS_PER_PAGE = 8;

// Helper to convert a Real Venue to Activity Data format
const mapVenueToActivity = (venue: Venue): ActivityData => {
  return {
    id: venue.id, // CRITICAL: Uses the real ID (e.g. "tagaytay-0")
    user: {
      name: venue.host.name,
      image: venue.host.avatar,
      action: "Recently booked",
      time: "2 hours ago", // Mock time
    },
    business: {
      name: venue.title,
      image: venue.images[0],
      rating: venue.rating,
      category: venue.category,
      location: venue.location,
      details: `${venue.guestCount} guests · ${venue.bedroomCount} bedrooms`,
    },
    content: {
      text: venue.description.substring(0, 100) + "...",
      images: venue.images.slice(0, 1),
    },
    reviews: [] 
  };
};

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // --- CHANGE: Shuffle and slice real venues ---
      // We shuffle to get random "recent" activities every refresh
      const shuffled = [...HARDCODED_VENUES].sort(() => 0.5 - Math.random());
      const selectedVenues = shuffled.slice(0, 30); // Pick 30 random venues
      
      const mappedActivities = selectedVenues.map(mapVenueToActivity);
      
      setActivities(mappedActivities);
      setDisplayedActivities(mappedActivities.slice(0, ITEMS_PER_PAGE));
      setHasMore(mappedActivities.length > ITEMS_PER_PAGE);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const nextPage = page + 1;
    const startIndex = 0; // We keep showing previous items
    const endIndex = nextPage * ITEMS_PER_PAGE;
    
    // Check if we actually have more items
    if (endIndex > activities.length) {
        setHasMore(false);
    }
    
    const newDisplayed = activities.slice(0, endIndex);
    setDisplayedActivities(newDisplayed);
    setPage(nextPage);
    setIsLoading(false);
  }, [activities, page]);

  // Placeholder functions to satisfy interface if needed
  const filterByCategory = useCallback(() => {}, []); 
  const sortActivities = useCallback(() => {}, []);
  const toggleFavorite = useCallback(() => {}, []);

  return {
    activities: displayedActivities,
    isLoading,
    hasMore,
    loadMore,
    filterByCategory,
    sortActivities,
    toggleFavorite,
  };
}
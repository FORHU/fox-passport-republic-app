// src/hooks/useRecentActivity.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { ActivityData, ACTIVITY_DATA } from "@/src/data/recentActivity";

const ITEMS_PER_PAGE = 8;

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Initialize activities (simulates API call)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In production, replace with: const data = await fetch('/api/activities').then(r => r.json());
      setActivities(ACTIVITY_DATA);
      setDisplayedActivities(ACTIVITY_DATA.slice(0, ITEMS_PER_PAGE));
      setHasMore(ACTIVITY_DATA.length > ITEMS_PER_PAGE);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Load more activities
  const loadMore = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const nextPage = page + 1;
    const startIndex = 0;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    
    const newDisplayed = activities.slice(startIndex, endIndex);
    setDisplayedActivities(newDisplayed);
    setPage(nextPage);
    setHasMore(endIndex < activities.length);
    setIsLoading(false);
  }, [activities, page]);

  // Filter by category
  const filterByCategory = useCallback((category: string | null) => {
    if (!category) {
      setDisplayedActivities(activities.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      setHasMore(activities.length > ITEMS_PER_PAGE);
      return;
    }

    const filtered = activities.filter(
      (activity) => activity.business.category.toLowerCase() === category.toLowerCase()
    );
    setDisplayedActivities(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [activities]);

  // Sort activities
  const sortActivities = useCallback((sortBy: "recent" | "rating") => {
    const sorted = [...activities];
    
    if (sortBy === "rating") {
      sorted.sort((a, b) => b.business.rating - a.business.rating);
    }
    // "recent" is already the default order
    
    setActivities(sorted);
    setDisplayedActivities(sorted.slice(0, page * ITEMS_PER_PAGE));
  }, [activities, page]);

  // Toggle favorite (mock function - in production, call API)
  const toggleFavorite = useCallback((activityId: string) => {
    // In production: await fetch(`/api/favorites/${activityId}`, { method: 'POST' });
    console.log(`Toggled favorite for activity: ${activityId}`);
  }, []);

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
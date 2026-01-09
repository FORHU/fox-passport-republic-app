"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { Event, EventsApiResponse } from "@/types/event";

interface UseEventsByCategoryReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Helper function to convert category name to slug
// Matches backend slug format: "Food & Dining" -> "food-dining"
function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-"); // Collapse multiple hyphens into one
}

export function useEventsByCategory(
  categoryName: string | null
): UseEventsByCategoryReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!categoryName) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert category name to slug format
      const slug = categoryNameToSlug(categoryName);

      const response = await api.get<EventsApiResponse>(
        `/v1/events/by-category/${slug}`
      );

      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError("Failed to fetch events");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
      console.error("Error fetching events by category:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/shared/lib/axios";
import type { Event, EventsApiResponse } from "@/shared/types/event";

interface UseEventsByCategoryReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEventsByCategory(
  categoryName: string | null,
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

      // Same public endpoint as the server fetch (getEventsByCategory in
      // shared/lib/server/data.ts). There is no /events/by-category route; the
      // API ignores a `category` that isn't one (e.g. "all") and lists every one.
      const response = await api.get<EventsApiResponse>(
        "/event-templates/browse",
        { params: { category: categoryName } },
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

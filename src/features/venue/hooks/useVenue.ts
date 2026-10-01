"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchVenueById,
  fetchVenueUnavailableDates,
} from "@/features/venue/api/venues";

// Same key VenueListingDetailsForm reads and invalidates, so an edit there
// refreshes every other view of the venue too.
export const venueQueryKey = (venueId: string) => ["venue", venueId] as const;

/** One venue by id, cached and shared across the pages showing it. */
export function useVenue(venueId: string | undefined) {
  return useQuery({
    queryKey: venueQueryKey(venueId ?? ""),
    queryFn: () => fetchVenueById(venueId!),
    enabled: !!venueId,
  });
}

/**
 * Days a venue can't be booked, from today to a year out — generous enough
 * for any realistic booking horizon without the response growing unbounded.
 * Always treated as stale (like the other availability queries): a revisit
 * paints the cached calendar at once and refetches behind it.
 */
export function useVenueUnavailableDates(venueId: string | undefined) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  return useQuery({
    queryKey: ["availability", "venue", venueId, startIso],
    queryFn: () => fetchVenueUnavailableDates(venueId!, startIso, endIso),
    enabled: !!venueId,
    staleTime: 0,
  });
}

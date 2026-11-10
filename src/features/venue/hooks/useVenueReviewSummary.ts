"use client";

import { useQuery } from "@tanstack/react-query";
import { getReviewsByListing } from "@/shared/api/reviews";
import type { Review } from "@/shared/types/review";

export interface ReviewSummary {
  count: number;
  /** One decimal place; `null` when there are no reviews to average. */
  average: number | null;
}

/**
 * The count decides whether a venue is rated, never the average: a venue
 * nobody reviewed has no rating (`null`), while a real review of 0 averages
 * to 0.
 */
export function summarizeReviews(
  reviews: Pick<Review, "rating">[],
): ReviewSummary {
  const count = reviews.length;
  if (count === 0) return { count, average: null };
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return { count, average: Number((sum / count).toFixed(1)) };
}

/**
 * A venue's review count and average, from its reviews list. The venue payload
 * itself carries neither. Uses `VenueReviews`' default query (same key and
 * fetcher), so the page makes one request for both. `undefined` while loading.
 *
 * The API returns at most the newest 200 reviews and no total, so past that
 * the count and average cover those 200.
 */
export function useVenueReviewSummary(
  venueId: string | undefined,
): ReviewSummary | undefined {
  const { data } = useQuery({
    queryKey: ["venue-reviews", venueId, "most_helpful"],
    queryFn: () => getReviewsByListing(venueId as string, "most_helpful"),
    enabled: !!venueId,
    staleTime: 1000 * 60 * 5,
  });
  return data ? summarizeReviews(data.reviews) : undefined;
}

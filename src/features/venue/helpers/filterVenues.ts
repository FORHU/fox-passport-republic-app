// src/features/venue/helpers/filterVenues.ts

/**
 * Venue interface for filtering operations
 */
export interface FilterableVenue {
  location?: string;
  province?: string;
  category?: string;
}

/**
 * Category keyword mapping for flexible filtering
 * Maps display category names to venue category keywords
 */
const CATEGORY_FILTER_MAP: Record<string, readonly string[]> = {
  "hotels & travel": [
    "hotel",
    "resort",
    "villa",
    "condo",
    "apartment",
    "suite",
    "inn",
    "lodge",
    "room",
    "cabin",
    "glamping",
  ],
  "event planning & services": ["garden", "function", "events", "historic", "event"],
  restaurants: ["dining", "restaurant"],
  food: ["dining", "restaurant"],
  "arts & entertainment": ["art", "gallery", "museum", "historic"],
  nightlife: ["bar", "club", "lounge"],
  "real estate": ["house", "condo", "apartment", "loft"],
  adventures: ["hiking", "paragliding", "diving", "surfing", "zip"],
  camping: ["cabin", "glamping", "camp", "forest", "mountain"],
  "music & arts": ["art", "music", "gallery", "museum"],
  venues: ["venue", "event", "garden", "hall"],
  wellness: ["spa", "wellness", "resort"],
  "food & dining": ["restaurant", "dining", "food"],
} as const;

/**
 * Filters venues by location and/or category
 * @param venues - Array of venue objects to filter
 * @param locationQuery - Optional location string to filter by (matches location or province)
 * @param categoryQuery - Optional category string to filter by
 * @returns Filtered array of venues matching the query parameters
 * @example
 * filterVenues(venues, "quezon", "hotels & travel")
 * // Returns venues in Quezon with hotel/resort categories
 */
export function filterVenues<T extends FilterableVenue>(
  venues: T[],
  locationQuery?: string,
  categoryQuery?: string
): T[] {
  let filtered: T[] = venues;

  // Filter by location if provided
  if (locationQuery?.trim()) {
    const lowerLocationQuery = locationQuery.toLowerCase();
    filtered = filtered.filter((venue) => {
      const location = String(venue.location ?? "").toLowerCase();
      const province = String(venue.province ?? "").toLowerCase();
      return location.includes(lowerLocationQuery) || province.includes(lowerLocationQuery);
    });
  }

  // Filter by category if provided
  if (categoryQuery?.trim()) {
    const lowerCategoryQuery = categoryQuery.toLowerCase();
    const keywords =
      CATEGORY_FILTER_MAP[lowerCategoryQuery as keyof typeof CATEGORY_FILTER_MAP];

    filtered = filtered.filter((venue) => {
      const venueCategory = String(venue.category ?? "").toLowerCase();

      // If mapped category keywords exist, check against them
      if (keywords) {
        return keywords.some((keyword) => venueCategory.includes(keyword));
      }

      // Otherwise, do a direct substring match
      return venueCategory.includes(lowerCategoryQuery);
    });
  }

  return filtered;
}

/**
 * Gets all available category filter options
 * @returns Array of category filter keys
 */
export function getCategoryFilterOptions(): string[] {
  return Object.keys(CATEGORY_FILTER_MAP);
}

/**
 * Gets keywords for a specific category filter
 * @param category - The category filter name
 * @returns Array of keywords for that category, or undefined if not found
 */
export function getCategoryKeywords(
  category: string
): readonly string[] | undefined {
  return CATEGORY_FILTER_MAP[category.toLowerCase() as keyof typeof CATEGORY_FILTER_MAP];
}
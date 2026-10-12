import api from "@/shared/lib/axios";

export interface VenueSearchResult {
  id: string;
  name: string;
  city: string | null;
  mayorId: string;
}

/**
 * Lightweight name search for pickers (e.g. targeting a venue for a
 * revenue-share investment) — not the full venue object.
 */
export async function searchVenues(
  query: string,
): Promise<VenueSearchResult[]> {
  if (!query.trim()) return [];
  const resp = await api.get("/venues", {
    params: { search: query, limit: 10 },
  });
  const data = resp.data;
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.venues)
      ? data.venues
      : Array.isArray(data)
        ? data
        : [];
  return list;
}

// ---------------------------------------------------------------------------
// Shared types and pure data transformers for landing journey data.
// Safe to import in both Server Components and Client Components.
// ---------------------------------------------------------------------------

export interface LandingVenue {
  id: string;
  name: string;
  city: string;
  category: string;
  lat: number;
  lng: number;
  image?: string;
}

export interface LandingEventLocation {
  key: string;
  city: string;
  country?: string;
  lat: number;
  lng: number;
  events: LandingEvent[];
}

export interface LandingEvent {
  id: string;
  name: string;
  category?: string;
  targetCity?: string;
  targetCountry?: string;
  lat?: number | null;
  lng?: number | null;
  description?: string;
  images?: { url: string }[];
  estimatedTotal?: number;
  templateVenues?: {
    venue?: {
      city?: string;
      lat?: number | null;
      lng?: number | null;
    };
  }[];
}

export interface LandingFoxer {
  id: string;
  name: string;
  city?: string;
  roles: string[];
}

/** Filter and normalize raw venue objects into clean LandingVenue models */
export function filterLandingVenues(list: any[]): LandingVenue[] {
  const located = (list ?? [])
    .filter(
      (v) =>
        typeof v?.lat === "number" &&
        typeof v?.lng === "number" &&
        v?.status !== "rejected",
    )
    .map((v): LandingVenue => ({
      id: v.id,
      name: v.name,
      city: v.city ?? "",
      category: v.category ?? "other",
      lat: v.lat,
      lng: v.lng,
      image:
        typeof v.images?.[0] === "string"
          ? v.images[0]
          : v.images?.[0]?.url,
    }));

  // A stray bad coordinate would send the whole map to the wrong country,
  // so keep what sits near the middle of the pack.
  const median = (n: number[]) =>
    [...n].sort((a, b) => a - b)[Math.floor(n.length / 2)] ?? 0;
  const mLat = median(located.map((v) => v.lat));
  const mLng = median(located.map((v) => v.lng));

  return located.filter(
    (v) => Math.abs(v.lat - mLat) < 12 && Math.abs(v.lng - mLng) < 12,
  );
}

/** Load at most 300 public templates, respecting the API's 50-item page limit. */
export async function loadLandingEvents(
  limit: number,
  fetchPage: (page: number, pageLimit: number) => Promise<LandingEvent[]>,
): Promise<LandingEvent[]> {
  const target = Math.min(300, Math.max(0, Math.floor(limit)));
  const events: LandingEvent[] = [];
  let page = 1;

  while (events.length < target) {
    const pageSize = Math.min(50, target - events.length);
    const batch = await fetchPage(page, pageSize);
    events.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
  }

  return events.slice(0, target);
}

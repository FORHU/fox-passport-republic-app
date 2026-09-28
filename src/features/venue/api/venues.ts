import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import { parseVenueListResponse } from "./schemas";

function unwrapList(data: any): any[] {
  return parseVenueListResponse(data);
}

function unwrapOne(data: any): any {
  return data?.venue ?? data?.data ?? data;
}

export async function fetchVenuesByHostId(hostId: Id): Promise<any[]> {
  const resp = await api.get("/venues", { params: { hostId: String(hostId) } });
  return unwrapList(resp.data);
}

export async function fetchVenueById(id: Id): Promise<any> {
  const resp = await api.get(`/venues/${id}`);
  return unwrapOne(resp.data);
}

export async function createVenue(payload: any): Promise<any> {
  const resp = await api.post("/venues/create", payload);
  return unwrapOne(resp.data);
}

export async function updateVenue(venueId: Id, payload: any): Promise<any> {
  const resp = await api.put(`/venues/${venueId}`, payload);
  return unwrapOne(resp.data);
}

export async function deleteVenue(venueId: Id): Promise<void> {
  await api.delete(`/venues/${venueId}`);
}

export interface VenueSearchResult {
  id: string;
  name: string;
  city: string | null;
  mayorId: string;
}

/** Lightweight name search for pickers (e.g. targeting a venue for a
 *  revenue-share investment) — not the full venue object. */
export async function searchVenues(
  query: string,
): Promise<VenueSearchResult[]> {
  if (!query.trim()) return [];
  // Deliberately not `lightweight: true` — that mode's `select` is tuned for
  // map-pin rendering (lat/lng/boundary/price/images) and omits `city`/
  // `mayorId`, both of which this picker needs.
  const resp = await api.get("/venues", {
    params: { search: query, limit: 10 },
  });
  return unwrapList(resp.data);
}

export async function fetchVenueCatalog(): Promise<{
  tech: string[];
  amenities: string[];
  staff: string[];
}> {
  const resp = await api.get("/venues/catalog");
  return resp.data;
}

export interface ReferenceBoundary {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  boundary: [number, number][] | null;
  category: string | null;
  image: string | null;
}

// Read-only reference layer for the map picker: every other live venue's
// location — a drawn shape where it has one, otherwise just its pin — so a
// host can see what they'd overlap (and what's around generally) while
// drawing. `excludeId` omits the venue currently being edited.
export async function fetchReferenceBoundaries(
  excludeId?: Id,
): Promise<ReferenceBoundary[]> {
  const resp = await api.get("/venues/boundaries", {
    params: excludeId ? { excludeId: String(excludeId) } : undefined,
  });
  const raw = resp.data?.boundaries;
  return Array.isArray(raw) ? raw : [];
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FetchVenuesQuery extends Partial<ViewportBounds> {
  page?: number;
  limit?: number;
  category?: string;
  mayorId?: string;
  lightweight?: boolean;
  search?: string;
}

export async function fetchVenuesByViewport(
  params: FetchVenuesQuery,
): Promise<{ venues: any[]; total: number }> {
  const resp = await api.get("/venues", { params });
  return {
    venues: unwrapList(resp.data),
    total: resp.data?.total ?? 0,
  };
}

// Venues whose drawn service-area boundary actually covers a point — not a
// proximity radius. Answers "does any venue serve this exact location," which
// the viewport query above can't: a venue's boundary can be huge (covers the
// point from far outside the current screen) or absent entirely (a pin-only
// venue never matches here, by design). Public, no auth.
export async function fetchVenuesNear(
  lat: number,
  lng: number,
): Promise<any[]> {
  const resp = await api.get("/venues/near", { params: { lat, lng } });
  return Array.isArray(resp.data?.venues) ? resp.data.venues : [];
}

export interface VenueUnavailability {
  /** Every unavailable day (YYYY-MM-DD) — booked and manually blocked, unioned. */
  dates: string[];
  /** Subset of `dates` the host blocked themselves — the only ones a host UI
   *  can offer to unblock; the rest belong to a citizen's real booking. */
  blockedDates: string[];
}

// Days a venue can't be booked for, within [start, end).
export async function fetchVenueUnavailableDates(
  venueId: Id,
  start: string,
  end: string,
): Promise<VenueUnavailability> {
  const resp = await api.get(`/venues/${venueId}/unavailable-dates`, {
    params: { start, end },
  });
  return {
    dates: Array.isArray(resp.data?.dates) ? resp.data.dates : [],
    blockedDates: Array.isArray(resp.data?.blockedDates)
      ? resp.data.blockedDates
      : [],
  };
}

export async function blockVenueDate(
  venueId: Id,
  date: string,
): Promise<void> {
  await api.post(`/venues/${venueId}/blocked-dates`, { date });
}

export async function unblockVenueDate(
  venueId: Id,
  date: string,
): Promise<void> {
  await api.delete(`/venues/${venueId}/blocked-dates/${date}`);
}

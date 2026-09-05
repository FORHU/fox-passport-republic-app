import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";

function unwrapList(data: any): any[] {
  const raw = data?.venues ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
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

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

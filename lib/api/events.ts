import api from "@/lib/axios";
import type { Id } from "./types";

function unwrapListResponse(data: any): any[] {
  const raw = data?.templates ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchEventsByHostId(hostId: Id): Promise<any[]> {
  const resp = await api.get("/event-templates", { params: { ownerId: String(hostId) } });
  return unwrapListResponse(resp.data);
}

export async function updateEvent(eventId: Id, payload: any): Promise<any> {
  const resp = await api.put(`/event-templates/${eventId}`, payload);
  return resp.data?.template ?? resp.data?.data ?? resp.data;
}

export async function deleteEvent(eventId: Id): Promise<void> {
  await api.delete(`/event-templates/${eventId}`);
}

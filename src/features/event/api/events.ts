import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";

function unwrapListResponse(data: unknown): unknown[] {
  const raw = (data as { templates?: unknown[]; data?: unknown[] } | unknown[])?.templates ?? (data as { data?: unknown[] } | unknown[])?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchEventsByHostId(hostId: Id): Promise<unknown[]> {
  const resp = await api.get("/event-templates", { params: { ownerId: String(hostId) } });
  return unwrapListResponse(resp.data);
}

export async function updateEvent(eventId: Id, payload: unknown): Promise<unknown> {
  const resp = await api.put(`/event-templates/${eventId}`, payload);
  return resp.data?.template ?? resp.data?.data ?? resp.data;
}

export async function deleteEvent(eventId: Id): Promise<void> {
  await api.delete(`/event-templates/${eventId}`);
}

export async function submitEventTemplate(eventId: Id): Promise<unknown> {
  const resp = await api.post(`/event-templates/${eventId}/submit`);
  return resp.data?.template ?? resp.data;
}

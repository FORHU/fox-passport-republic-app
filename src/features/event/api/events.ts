import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";

function unwrapListResponse(data: unknown): unknown[] {
  // If the response is already an array, return it
  if (Array.isArray(data)) return data;

  // Ensure data is an object before accessing properties
  if (data == null || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;

  const templates = obj.templates;
  if (Array.isArray(templates)) return templates;

  const events = obj.events;
  if (Array.isArray(events)) return events;

  const d = obj.data;
  if (Array.isArray(d)) return d;

  return [];
}

export async function fetchEventsByHostId(hostId: Id): Promise<any[]> {
  const resp = await api.get("/event-templates", {
    params: { ownerId: String(hostId) },
  });
  return unwrapListResponse(resp.data);
}

// Real, already-scheduled Event rows this user organizes (created once a
// template is booked) — distinct from fetchEventsByHostId's EventTemplates.
// Used by the Republic Feed compose flow, whose event_announcement post
// type is validated server-side against a real Event id.
export async function fetchOrganizerEvents(organizerId: Id): Promise<any[]> {
  const resp = await api.get("/events", {
    params: { organizerId: String(organizerId) },
  });
  return unwrapListResponse(resp.data);
}

export async function updateEvent(
  eventId: Id,
  payload: unknown,
): Promise<unknown> {
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

import api from "@/lib/axios";
import type { Id } from "./types";

function unwrapListResponse(data: any): any[] {
  const raw = data?.events ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchEventsByHostId(hostId: Id): Promise<any[]> {
  const idStr = String(hostId);

  // Backend appears to use different param names across deployments.
  const paramAttempts: Array<Record<string, string>> = [
    { organizerId: idStr },
    { organizer_id: idStr },
    { hostId: idStr },
    { host_id: idStr },
    { userId: idStr },
    { user_id: idStr },
    { ownerId: idStr },
    { owner_id: idStr },
  ];

  let lastErr: any = null;
  for (const params of paramAttempts) {
    try {
      const resp = await api.get("/events", { params });
      return unwrapListResponse(resp.data);
    } catch (e: any) {
      lastErr = e;
      const status = e?.response?.status;
      if (!status) break;
    }
  }

  throw lastErr;
}

export async function updateEvent(
  eventId: Id,
  payload: any
): Promise<any> {
  const resp = await api.put(`/events/${eventId}`, payload);
  return resp.data?.event ?? resp.data?.data ?? resp.data;
}


import api from "@/lib/axios";
import type { Id } from "./types";

function unwrapListResponse(data: any): any[] {
  const raw = data?.venues ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

export async function fetchVenuesByHostId(hostId: Id): Promise<any[]> {
  const idStr = String(hostId);

  const paramAttempts: Array<Record<string, string>> = [
    { hostId: idStr },
    { host_id: idStr },
    { organizerId: idStr },
    { organizer_id: idStr },
    { ownerId: idStr },
    { owner_id: idStr },
    { userId: idStr },
    { user_id: idStr },
  ];

  let lastErr: any = null;
  for (const params of paramAttempts) {
    try {
      const resp = await api.get("/v1/venues", { params });
      return unwrapListResponse(resp.data);
    } catch (e: any) {
      lastErr = e;
      const status = e?.response?.status;
      if (!status) break;
    }
  }

  throw lastErr;
}

export async function updateVenue(
  venueId: Id,
  payload: any
): Promise<any> {
  const resp = await api.put(`/v1/venues/${venueId}`, payload);
  return resp.data?.venue ?? resp.data?.data ?? resp.data;
}


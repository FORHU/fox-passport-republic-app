import api from "@/shared/lib/axios";

export type AffiliationStatus = "pending" | "approved" | "rejected" | "revoked";
export type AffiliationInitiator = "eventFoxer" | "venueFoxer";

export interface VenueAffiliation {
  id: string;
  venueId: string;
  eventFoxerId: string;
  initiatedBy: AffiliationInitiator;
  status: AffiliationStatus;
  permissions: string[];
  agreedPrice?: number | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  venue?: { id: string; name: string; mayorId?: string; images?: { url: string }[] };
  eventFoxer?: { id: string; name: string; imgId?: string | null };
}

export interface MyAffiliations {
  asEventFoxer: VenueAffiliation[];
  asVenueMayor: VenueAffiliation[];
}

export async function fetchMyAffiliations(): Promise<MyAffiliations> {
  const resp = await api.get("/venue-affiliations/mine");
  return resp.data?.data ?? { asEventFoxer: [], asVenueMayor: [] };
}

export async function fetchVenueAffiliates(
  venueId: string,
): Promise<VenueAffiliation[]> {
  const resp = await api.get(`/venue-affiliations/venue/${venueId}`);
  return resp.data?.data ?? [];
}

export async function applyToVenue(venueId: string): Promise<VenueAffiliation> {
  const resp = await api.post("/venue-affiliations/apply", { venueId });
  return resp.data.data;
}

export async function inviteEventFoxer(
  venueId: string,
  eventFoxerId: string,
): Promise<VenueAffiliation> {
  const resp = await api.post("/venue-affiliations/invite", {
    venueId,
    eventFoxerId,
  });
  return resp.data.data;
}

export async function approveAffiliation(id: string): Promise<VenueAffiliation> {
  const resp = await api.patch(`/venue-affiliations/${id}/approve`);
  return resp.data.data;
}

export async function rejectAffiliation(
  id: string,
  rejectionReason?: string,
): Promise<VenueAffiliation> {
  const resp = await api.patch(`/venue-affiliations/${id}/reject`, {
    rejectionReason,
  });
  return resp.data.data;
}

/** Withdraws a still-pending affiliation. Either party (applicant or
 * inviter) may call this — distinct from revokeAffiliation, which only
 * ends an already-approved one and is venue-owner-only. */
export async function cancelAffiliation(id: string): Promise<VenueAffiliation> {
  const resp = await api.patch(`/venue-affiliations/${id}/cancel`);
  return resp.data.data;
}

/** Ends an approved affiliation. Venue-owner-only — the affiliated Event
 * Foxer can no longer end it themselves; see cancelAffiliation for the
 * still-pending case either party can act on. */
export async function revokeAffiliation(id: string): Promise<VenueAffiliation> {
  const resp = await api.delete(`/venue-affiliations/${id}`);
  return resp.data.data;
}

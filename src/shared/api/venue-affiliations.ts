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

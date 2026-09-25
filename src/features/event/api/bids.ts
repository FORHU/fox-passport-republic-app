import api from "@/shared/lib/axios";

/**
 * Bids Foxers place on an Event's open supplier slots. Talent (services) and
 * Gear (assets) are separate lists in the api; `kind` keeps them apart here.
 */
export type BidKind = "service" | "asset";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface EventBid {
  id: string;
  kind: BidKind;
  status: BidStatus;
  message: string | null;
  proposedPrice: number;
  proposedQuantity?: number;
  createdAt: string;
  provider: { id: string; name: string | null; imgId: string | null };
  /** The listing the Foxer is offering. */
  offering: { id: string; name: string } | null;
  /** The slot the bid is for, and the currency its price is in. */
  slot: {
    description: string | null;
    currency: string;
    agreedPrice: number;
    matched: boolean;
  } | null;
  event: { id: string; name: string; startAt: string } | null;
}

function toBid(kind: BidKind, raw: any): EventBid {
  const offering = kind === "service" ? raw.proposedService : raw.proposedAsset;
  return {
    id: raw.id,
    kind,
    status: raw.status,
    message: raw.message ?? null,
    proposedPrice: Number(raw.proposedPrice ?? 0),
    proposedQuantity: raw.proposedQuantity,
    createdAt: raw.createdAt,
    provider: raw.provider,
    offering: offering ? { id: offering.id, name: offering.name } : null,
    slot: raw.targetRequirement
      ? {
          description: raw.targetRequirement.description ?? null,
          currency: raw.targetRequirement.currency,
          agreedPrice: Number(raw.targetRequirement.agreedPrice ?? 0),
          matched: !!raw.targetRequirement.matched,
        }
      : null,
    event: raw.event ?? null,
  };
}

/** Both lists for one Event, newest first. */
export async function fetchEventBids(eventId: string): Promise<EventBid[]> {
  const [services, assets] = await Promise.all([
    api.get(`/bids/service/event/${eventId}`),
    api.get(`/bids/asset/event/${eventId}`),
  ]);
  return [
    ...(services.data?.data ?? []).map((b: any) => toBid("service", b)),
    ...(assets.data?.data ?? []).map((b: any) => toBid("asset", b)),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function acceptBid(kind: BidKind, id: string): Promise<void> {
  await api.patch(`/bids/${kind}/${id}/accept`);
}

export async function rejectBid(kind: BidKind, id: string): Promise<void> {
  await api.patch(`/bids/${kind}/${id}/reject`);
}

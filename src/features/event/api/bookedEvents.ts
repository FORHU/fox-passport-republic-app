import api from "@/shared/lib/axios";
import { toProposal } from "@/shared/lib/eventEdit";
import type {
  BookedEventDetail,
  EventEditProposal,
  NeedsAttentionEvent,
  ReplacementCandidate,
  ReschedulePreview,
  SupplierKind,
} from "@/shared/types/eventEdit";

/**
 * The Event Foxer's booked events (api ADR 0010): which lost a Supplier and
 * why, and proposals to repair them (a replacement Supplier or a new date).
 * Every call is checked server-side against the event's organizer.
 */

/** Upcoming events that need a replacement Supplier, soonest first. */
export async function fetchNeedsAttention(): Promise<NeedsAttentionEvent[]> {
  const resp = await api.get("/event-transactions/needs-attention");
  return resp.data?.data ?? [];
}

/**
 * One of the host's own booked events with every Supplier on it. Null when it
 * isn't theirs to manage (an Organizer, or a template with no booking): the
 * API answers "not found" and the page simply shows no booked Suppliers.
 */
export async function fetchBookedEvent(
  eventId: string,
): Promise<BookedEventDetail | null> {
  try {
    const resp = await api.get(
      `/event-transactions/event/${encodeURIComponent(eventId)}`,
    );
    return resp.data?.data ?? null;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404 || status === 403) return null;
    throw err;
  }
}

/** Listings of the same kind and category that are free on the event's dates. */
export async function fetchReplacements(
  transactionId: string,
  kind: SupplierKind,
): Promise<ReplacementCandidate[]> {
  const resp = await api.get(
    `/event-transactions/${encodeURIComponent(transactionId)}/replacements`,
    { params: { kind } },
  );
  return (resp.data?.data ?? []).map((c: Record<string, unknown>) => ({
    itemId: String(c.itemId),
    name: String(c.name ?? ""),
    supplierName: String(c.supplierName ?? ""),
    category: c.category as string | undefined,
    price: Number(c.price ?? 0),
    partner: Boolean(c.partner),
  }));
}

/** Proposes a replacement; the API tells the citizen and posts it to the event's chat. */
export async function proposeReplacement(
  transactionId: string,
  body: { kind: SupplierKind; itemId: string; note?: string },
): Promise<EventEditProposal> {
  const resp = await api.post(
    `/event-transactions/${encodeURIComponent(transactionId)}/replace`,
    body,
  );
  return toProposal(resp.data?.data ?? {});
}

export async function withdrawProposal(proposalId: string): Promise<void> {
  await api.post(
    `/event-transactions/proposals/${encodeURIComponent(proposalId)}/withdraw`,
  );
}

/** A booking's proposals, newest first, date changes included. */
export async function fetchProposals(
  bookingId: string,
): Promise<EventEditProposal[]> {
  const resp = await api.get("/event-transactions/proposals", {
    params: { bookingId, include: "reschedule" },
  });
  return (resp.data?.data ?? []).map(toProposal);
}

/** The host declines an unpaid booking they can't run (ADR 0011). */
export async function hostDeclineBooking(
  bookingId: string,
  cause: "busy" | "other",
): Promise<void> {
  await api.post(`/bookings/${encodeURIComponent(bookingId)}/decline`, {
    cause,
  });
}

/** What moving the event to `startAt` would mean: who is free, who re-confirms. */
export async function previewReschedule(
  eventId: string,
  startAt: string,
): Promise<ReschedulePreview> {
  const resp = await api.get(
    `/event-transactions/event/${encodeURIComponent(eventId)}/reschedule-preview`,
    { params: { startAt } },
  );
  const d = resp.data?.data ?? {};
  return {
    ...d,
    currentPrice: Number(d.currentPrice ?? 0),
    proposedPrice: Number(d.proposedPrice ?? 0),
    priceDelta: Number(d.priceDelta ?? 0),
    lines: d.lines ?? [],
    skipped: d.skipped ?? [],
  };
}

/** Proposes the new date; the API tells the citizen and posts it to the event's chat. */
export async function proposeReschedule(
  eventId: string,
  body: { startAt: string; note?: string },
): Promise<EventEditProposal> {
  const resp = await api.post(
    `/event-transactions/event/${encodeURIComponent(eventId)}/reschedule`,
    body,
  );
  return toProposal(resp.data?.data ?? {});
}

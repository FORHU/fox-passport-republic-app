import api from "@/shared/lib/axios";
import { toProposal } from "@/shared/lib/eventEdit";
import type {
  AcceptProposalResult,
  BookingReplacementStatus,
  EventEditProposal,
} from "@/shared/types/eventEdit";

/**
 * The citizen's side of a booked event's repairs (api ADR 0010): which
 * Suppliers can't make it and by when the host must replace them, and the
 * host's proposals (a replacement Supplier or a new date) to accept or decline.
 */

export async function fetchBookingReplacement(
  bookingId: string,
): Promise<BookingReplacementStatus | null> {
  try {
    const resp = await api.get(
      `/event-transactions/booking/${encodeURIComponent(bookingId)}/replacement`,
    );
    const d = resp.data?.data;
    if (!d) return null;
    return { ...d, totalAmount: Number(d.totalAmount ?? 0), items: d.items ?? [] };
  } catch (err: unknown) {
    // A booking with no Event behind it has nothing to replace.
    if ((err as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/** Newest first, date changes included. */
export async function fetchBookingProposals(
  bookingId: string,
): Promise<EventEditProposal[]> {
  try {
    const resp = await api.get("/event-transactions/proposals", {
      params: { bookingId, include: "reschedule" },
    });
    return (resp.data?.data ?? []).map(toProposal);
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

export async function acceptProposal(
  proposalId: string,
): Promise<AcceptProposalResult> {
  const resp = await api.post(
    `/event-transactions/proposals/${encodeURIComponent(proposalId)}/accept`,
  );
  const d = resp.data?.data ?? {};
  if (d.paymentRequired) {
    return {
      proposalId: String(d.proposalId ?? proposalId),
      paymentRequired: true,
      amount: Number(d.amount ?? 0),
      clientSecret: d.clientSecret ?? null,
      paid: Boolean(d.paid),
    };
  }
  return { proposalId: String(d.proposalId ?? proposalId) };
}

/** After the difference was paid: applies the change (or refunds it). */
export async function confirmProposalPayment(proposalId: string): Promise<void> {
  await api.post(
    `/event-transactions/proposals/${encodeURIComponent(proposalId)}/confirm-payment`,
  );
}

export async function declineProposal(proposalId: string): Promise<void> {
  await api.post(
    `/event-transactions/proposals/${encodeURIComponent(proposalId)}/decline`,
  );
}

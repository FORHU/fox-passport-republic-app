"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pollWhileVisible } from "@/shared/lib/realtime";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import type { SupplierKind } from "@/shared/types/eventEdit";
import {
  fetchBookedEvent,
  fetchNeedsAttention,
  fetchProposals,
  fetchReplacements,
  hostDeclineBooking,
  previewReschedule,
  proposeReplacement,
  proposeReschedule,
  withdrawProposal,
} from "../api/bookedEvents";

/**
 * Keys start with "host-data" so the server's `bookings` socket topic (a
 * Supplier declined, the citizen answered) refreshes them with the rest of the
 * dashboard; see `TOPIC_QUERY_KEYS`.
 */
export const bookedEventKeys = {
  all: ["host-data", "booked-events"] as const,
  attention: ["host-data", "booked-events", "attention"] as const,
  detail: (eventId: string) =>
    ["host-data", "booked-events", "detail", eventId] as const,
  proposals: (bookingId: string) =>
    ["host-data", "booked-events", "proposals", bookingId] as const,
  replacements: (transactionId: string) =>
    ["host-data", "booked-events", "replacements", transactionId] as const,
  reschedule: (eventId: string, startAt: string) =>
    ["host-data", "booked-events", "reschedule", eventId, startAt] as const,
};

/** The host's upcoming events that lost a Supplier. */
export function useNeedsAttention(enabled = true) {
  return useQuery({
    queryKey: bookedEventKeys.attention,
    queryFn: fetchNeedsAttention,
    enabled,
    refetchInterval: pollWhileVisible,
  });
}

/** One booked event with its Suppliers; null when it isn't the viewer's to manage. */
export function useBookedEvent(eventId: string) {
  return useQuery({
    queryKey: bookedEventKeys.detail(eventId),
    queryFn: () => fetchBookedEvent(eventId),
    enabled: !!eventId,
    refetchInterval: pollWhileVisible,
  });
}

/** The booking's proposals, for the prices of the one waiting. */
export function useBookingProposals(bookingId: string | null | undefined) {
  return useQuery({
    queryKey: bookedEventKeys.proposals(bookingId ?? ""),
    queryFn: () => fetchProposals(bookingId!),
    enabled: !!bookingId,
  });
}

export function useReplacements(
  transactionId: string,
  kind: SupplierKind,
  enabled: boolean,
) {
  return useQuery({
    queryKey: bookedEventKeys.replacements(transactionId),
    queryFn: () => fetchReplacements(transactionId, kind),
    enabled,
  });
}

/** Who is free on `startAt` and who re-confirms; refetched per date picked. */
export function useReschedulePreview(eventId: string, startAt: string | null) {
  return useQuery({
    queryKey: bookedEventKeys.reschedule(eventId, startAt ?? ""),
    queryFn: () => previewReschedule(eventId, startAt!),
    enabled: !!startAt,
    retry: false,
  });
}

/** Proposing, withdrawing and declining, each refreshing the booked-event reads. */
export function useBookedEventActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: bookedEventKeys.all });

  const propose = useMutation({
    mutationFn: (v: {
      transactionId: string;
      kind: SupplierKind;
      itemId: string;
      note?: string;
    }) =>
      proposeReplacement(v.transactionId, {
        kind: v.kind,
        itemId: v.itemId,
        note: v.note,
      }),
    onSuccess: refresh,
  });

  const reschedule = useMutation({
    mutationFn: (v: { eventId: string; startAt: string; note?: string }) =>
      proposeReschedule(v.eventId, { startAt: v.startAt, note: v.note }),
    onSuccess: refresh,
  });

  const withdraw = useMutation({
    mutationFn: (proposalId: string) => withdrawProposal(proposalId),
    onSuccess: () => {
      toast.success("Proposal withdrawn.");
      refresh();
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Couldn't withdraw it. Try again.")),
  });

  const declineBooking = useMutation({
    mutationFn: (v: { bookingId: string; cause: "busy" | "other" }) =>
      hostDeclineBooking(v.bookingId, v.cause),
    onSuccess: () => {
      toast.success("You declined. The citizen and the Suppliers were told.");
      refresh();
    },
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, "Couldn't decline this booking. Try again."),
      ),
  });

  return { propose, reschedule, withdraw, declineBooking };
}

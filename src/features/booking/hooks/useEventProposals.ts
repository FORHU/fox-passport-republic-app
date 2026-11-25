"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pollWhileVisible } from "@/shared/lib/realtime";
import {
  acceptProposal,
  confirmProposalPayment,
  declineProposal,
  fetchBookingProposals,
  fetchBookingReplacement,
} from "../api/eventProposals";

/**
 * Keys start with "user-bookings" so the server's `bookings` socket topic (the
 * host proposed, a Supplier dropped out) refreshes them; see `TOPIC_QUERY_KEYS`.
 */
export const eventProposalKeys = {
  all: (bookingId: string) => ["user-bookings", "event-edit", bookingId] as const,
  proposals: (bookingId: string) =>
    ["user-bookings", "event-edit", bookingId, "proposals"] as const,
  replacement: (bookingId: string) =>
    ["user-bookings", "event-edit", bookingId, "replacement"] as const,
};

export function useBookingReplacement(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: eventProposalKeys.replacement(bookingId),
    queryFn: () => fetchBookingReplacement(bookingId),
    enabled,
    refetchInterval: pollWhileVisible,
  });
}

export function useBookingProposalList(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: eventProposalKeys.proposals(bookingId),
    queryFn: () => fetchBookingProposals(bookingId),
    enabled,
    refetchInterval: pollWhileVisible,
  });
}

/** Accept, decline and confirm a paid difference; each refreshes the booking. */
export function useProposalAnswers(bookingId: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["user-bookings"] });

  const accept = useMutation({
    mutationFn: (proposalId: string) => acceptProposal(proposalId),
  });
  const decline = useMutation({
    mutationFn: (proposalId: string) => declineProposal(proposalId),
    onSettled: refresh,
  });
  const confirmPayment = useMutation({
    mutationFn: (proposalId: string) => confirmProposalPayment(proposalId),
  });

  return {
    accept,
    decline,
    confirmPayment,
    refresh,
    keys: eventProposalKeys.all(bookingId),
  };
}

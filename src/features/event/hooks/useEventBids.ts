"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acceptBid,
  fetchEventBids,
  rejectBid,
  type BidKind,
} from "../api/bids";

export const eventBidKeys = {
  list: (eventId: string) => ["event-bids", eventId] as const,
};

function errorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}

/** One Event's bids, with accept (Owner only, api-enforced) and reject. */
export function useEventBids(eventId: string) {
  const queryClient = useQueryClient();
  const key = eventBidKeys.list(eventId);
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const bids = useQuery({
    queryKey: key,
    queryFn: () => fetchEventBids(eventId),
  });

  const accept = useMutation({
    mutationFn: ({ kind, id }: { kind: BidKind; id: string }) =>
      acceptBid(kind, id),
    onSuccess: () => {
      toast.success("Bid accepted");
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err, "Could not accept the bid")),
  });

  const reject = useMutation({
    mutationFn: ({ kind, id }: { kind: BidKind; id: string }) =>
      rejectBid(kind, id),
    onSuccess: () => {
      toast.success("Bid rejected");
      refresh();
    },
    onError: (err) => toast.error(errorMessage(err, "Could not reject the bid")),
  });

  return { bids, accept, reject };
}

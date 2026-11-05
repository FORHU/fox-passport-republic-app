import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEventPaymentSummary,
  createEventCheckout,
  cancelEvent,
} from "@/features/event/api/checkout";
import { getRewardsWallet } from "@/shared/api/rewards";
import type { Id } from "@/shared/lib/api-types";
import type { CheckoutErrorResponse } from "@/shared/types/payment";
import { formatCurrency } from "@/shared/lib/currency";

export const useEventPaymentSummary = (
  eventId: Id,
  voucherCodes: string[] = [],
) => {
  return useQuery({
    queryKey: ["eventPaymentSummary", eventId, voucherCodes],
    queryFn: () => getEventPaymentSummary(eventId, voucherCodes),
    enabled: !!eventId,
  });
};

export const useEventCheckoutMutation = () => {
  return useMutation({
    mutationFn: ({
      eventId,
      voucherCodes,
    }: {
      eventId: Id;
      voucherCodes?: string[];
    }) => createEventCheckout(eventId, voucherCodes),
    onSuccess: (data) => {
      // Must use window.location.href, not router.push because Stripe checkout is off-origin
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid checkout URL returned.");
      }
    },
    onError: (error: any) => {
      const body: CheckoutErrorResponse | undefined = error?.response?.data;
      if (body?.code === "ITEMS_AWAITING_CONFIRMATION") {
        toast.error(
          `${body.blockingItemIds.length} item(s) are still awaiting provider confirmation — resolve them below before paying.`,
        );
        return;
      }
      if (body?.code === "AVAILABILITY_CONFLICT") {
        toast.error(
          "One of your items is no longer available for these dates. Remove or replace it before paying.",
        );
        return;
      }
      toast.error(body?.message || "Could not initialize checkout.");
    },
  });
};

export const useCancelEventMutation = (eventId: Id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelEvent(eventId),
    onSuccess: (data) => {
      toast.success(
        data.totalRefunded > 0
          ? `Event cancelled — ${formatCurrency(data.totalRefunded)} refunded.`
          : "Event cancelled.",
      );
      queryClient.invalidateQueries({ queryKey: ["eventPaymentSummary", eventId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Could not cancel event.");
    },
  });
};

export const useAvailableCoinVouchers = () => {
  const query = useQuery({
    queryKey: ["rewards", "wallet"],
    queryFn: getRewardsWallet,
    staleTime: 1000 * 30,
  });

  const codes = useMemo(() => {
    if (!query.data?.history) return [];
    const set = new Set<string>();
    for (const h of query.data.history) {
      if (h.type === "REDEMPTION") {
        const match = h.action.match(/\((RWD-[A-Z0-9]+)\)/i);
        if (match && match[1]) {
          set.add(match[1]);
        }
      }
    }
    return Array.from(set);
  }, [query.data]);

  return { codes, isLoading: query.isLoading };
};

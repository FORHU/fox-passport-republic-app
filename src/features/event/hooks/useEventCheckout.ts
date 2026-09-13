import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getEventPaymentSummary, createEventCheckout } from "@/features/event/api/checkout";
import type { Id } from "@/shared/lib/api-types";

export const useEventPaymentSummary = (eventId: Id, voucherCode?: string) => {
  return useQuery({
    queryKey: ["eventPaymentSummary", eventId, voucherCode],
    queryFn: () => getEventPaymentSummary(eventId, voucherCode),
    enabled: !!eventId,
  });
};

export const useEventCheckoutMutation = () => {
  return useMutation({
    mutationFn: ({ eventId, voucherCode }: { eventId: Id; voucherCode?: string }) => 
      createEventCheckout(eventId, voucherCode),
    onSuccess: (data) => {
      // Must use window.location.href, not router.push because Stripe checkout is off-origin
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid checkout URL returned.");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Could not initialize checkout.");
    },
  });
};

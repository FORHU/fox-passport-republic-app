import { useQuery } from "@tanstack/react-query";
import { getInvoiceStatus } from "@/shared/api/invoice";
import type { Id } from "@/shared/lib/api-types";
import type { PaymentStatus } from "@/shared/types/payment";

const TERMINAL_STATUSES: readonly PaymentStatus[] = [
  "paid",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
];

export const useInvoiceStatusPoll = (invoiceId: Id | null) => {
  return useQuery({
    queryKey: ["invoiceStatus", invoiceId],
    queryFn: () => getInvoiceStatus(invoiceId as Id),
    enabled: !!invoiceId,
    refetchInterval: (query) => {
      // `paymentStatus`, not `status`: the API's own contract lets the two
      // disagree on purpose — a failed attempt leaves the invoice itself
      // "pending" (so the payer can retry) while `paymentStatus` reports
      // "failed" for that attempt. Polling on `status` would never see the
      // failure at all.
      //
      // Not "processing" specifically, either — nothing in the backend
      // ever sets that value; the real pre-confirmation state is "pending"
      // (right after the Stripe redirect, before the webhook lands). The
      // original `=== "processing"` check meant this never actually
      // polled: the success page would load once, read "pending", and
      // just sit there instead of resolving to "paid" on its own.
      const status = query.state.data?.paymentStatus;
      if (!status || TERMINAL_STATUSES.includes(status)) return false;
      return 2000;
    },
  });
};

import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import type {
  CheckoutResponse,
  PaymentSummaryResponse,
} from "@/shared/types/payment";

export async function createEventCheckout(
  eventId: Id,
  voucherCodes: string[] = [],
): Promise<CheckoutResponse> {
  const resp = await api.post(`/events/${eventId}/checkout`, {
    voucherCodes,
  });
  return resp.data;
}

export async function getEventPaymentSummary(
  eventId: Id,
  voucherCodes: string[] = [],
): Promise<PaymentSummaryResponse> {
  const resp = await api.get(`/events/${eventId}/payment-summary`, {
    params: { voucherCodes },
  });
  return resp.data;
}

export interface CancelEventResult {
  refunds: { amount: string; status: string }[];
  totalRefunded: number;
}

export async function cancelEvent(eventId: Id): Promise<CancelEventResult> {
  const resp = await api.post(`/events/${eventId}/cancel`);
  return resp.data?.data ?? resp.data;
}

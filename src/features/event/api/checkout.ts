import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import type {
  CheckoutResponse,
  PaymentSummaryResponse,
} from "@/shared/types/payment";

export async function createEventCheckout(
  eventId: Id,
  voucherCode?: string,
): Promise<CheckoutResponse> {
  const resp = await api.post(`/events/${eventId}/checkout`, { voucherCode });
  return resp.data;
}

export async function getEventPaymentSummary(
  eventId: Id,
  voucherCode?: string,
): Promise<PaymentSummaryResponse> {
  const resp = await api.get(`/events/${eventId}/payment-summary`, {
    params: { voucherCode },
  });
  return resp.data;
}

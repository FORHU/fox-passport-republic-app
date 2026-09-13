import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import type { CheckoutResponse } from "@/shared/types/payment";

export async function createSponsorshipCheckout(
  proposalId: Id,
  voucherCode?: string
): Promise<CheckoutResponse> {
  const resp = await api.post(`/partnerships/${proposalId}/checkout`, {
    voucherCode,
  });
  return resp.data;
}

import api from "@/shared/lib/axios";
import type { Id } from "@/shared/lib/api-types";
import type { CheckoutResponse } from "@/shared/types/payment";

export async function createSponsorshipCheckout(
  proposalId: Id,
  voucherCode?: string,
): Promise<CheckoutResponse> {
  const resp = await api.post(`/partnerships/${proposalId}/checkout`, {
    voucherCode,
  });
  return resp.data;
}

export interface CancelSponsorshipResult {
  refund: { amount: string; status: string } | null;
}

export async function cancelSponsorship(
  proposalId: Id,
): Promise<CancelSponsorshipResult> {
  const resp = await api.post(`/partnerships/${proposalId}/cancel`);
  return resp.data?.data ?? resp.data;
}

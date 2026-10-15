import api from "@/shared/lib/axios";

export type PayoutSourceType =
  | "event_asset_transaction"
  | "event_service_transaction"
  | "event_venue_transaction"
  | "event_host_markup"
  | "sponsorship"
  | "investor_revenue_share";

export type PayoutStatus = "pending" | "paid" | "failed";

export interface Payout {
  id: string;
  providerId: string;
  sourceType: PayoutSourceType;
  sourceId: string;
  allocationAmount: number;
  platformFeeAmount: number;
  gatewayFeeAmount: number;
  payoutAmount: number;
  status: PayoutStatus;
  providerReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyPayoutsResponse {
  payouts: Payout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totals: {
    paid: number;
    pending: number;
  };
}

export async function fetchMyPayouts(
  page = 1,
  limit = 20,
): Promise<MyPayoutsResponse> {
  const resp = await api.get("/payouts/me", { params: { page, limit } });
  return {
    payouts: resp.data?.data ?? [],
    pagination: resp.data?.pagination,
    totals: resp.data?.totals ?? { paid: 0, pending: 0 },
  };
}

export const PAYOUT_SOURCE_LABEL: Record<PayoutSourceType, string> = {
  event_asset_transaction: "Gear Rental",
  event_service_transaction: "Service Booking",
  event_venue_transaction: "Venue Booking",
  event_host_markup: "Host Markup",
  sponsorship: "Sponsorship",
  investor_revenue_share: "Investor Revenue Share",
};

import api from "@/shared/lib/axios";

export type DiscountType = "percentage" | "fixed";

export interface Voucher {
  id: string;
  code: string;
  promotionId: string;
  active: boolean;
  createdAt: string;
  _count?: { redemptions: number };
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  transactionType: string | null;
  category: string | null;
  subcategory: string | null;
  // Null on an admin/platform-wide promotion. Set on a Foxer's own
  // promotion — providerId is who made it, exactly one of
  // assetId/serviceId/venueId is the listing it's scoped to.
  providerId: string | null;
  assetId: string | null;
  serviceId: string | null;
  venueId: string | null;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  // When true, this promotion applies automatically at checkout — no code
  // to type. Still redeemed through a real (system-generated) Voucher under
  // the hood, so it still counts against usageLimit/perUserLimit.
  autoApply: boolean;
  createdAt: string;
  updatedAt: string;
  vouchers?: Voucher[];
}

export interface PromotionAnalytics {
  redemptionCount: number;
  totalDiscountGiven: number;
  firstRedeemedAt: string | null;
  lastRedeemedAt: string | null;
}

export type PromotionPayload = {
  name: string;
  description?: string | null;
  transactionType?: string | null;
  category?: string | null;
  subcategory?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  autoApply?: boolean;
};

/** What a Foxer sends when creating a voucher scoped to their own listing — exactly one of assetId/serviceId/venueId. */
export type OwnPromotionPayload = {
  name: string;
  description?: string | null;
  assetId?: string;
  serviceId?: string;
  venueId?: string;
  discountType: DiscountType;
  discountValue: number;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  autoApply?: boolean;
};

function unwrapList<T>(data: unknown): T[] {
  const record = data as Record<string, unknown> | undefined;
  const raw = record?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function unwrapOne<T>(data: unknown): T {
  const record = data as Record<string, unknown> | undefined;
  return (record?.data ?? data) as T;
}

export async function fetchPromotions(
  includeInactive = false,
): Promise<Promotion[]> {
  const resp = await api.get("/admin/promotions", {
    params: includeInactive ? { includeInactive: "true" } : undefined,
  });
  return unwrapList<Promotion>(resp.data);
}

export async function fetchPromotionById(id: string): Promise<Promotion> {
  const resp = await api.get(`/admin/promotions/${id}`);
  return unwrapOne<Promotion>(resp.data);
}

export async function createPromotion(
  payload: PromotionPayload,
): Promise<Promotion> {
  const resp = await api.post("/admin/promotions", payload);
  return unwrapOne<Promotion>(resp.data);
}

export async function updatePromotion(
  id: string,
  payload: Partial<PromotionPayload> & { active?: boolean },
): Promise<Promotion> {
  const resp = await api.put(`/admin/promotions/${id}`, payload);
  return unwrapOne<Promotion>(resp.data);
}

export async function deletePromotion(id: string): Promise<void> {
  await api.delete(`/admin/promotions/${id}`);
}

export async function generateVouchers(
  promotionId: string,
  count: number,
  prefix?: string,
): Promise<Voucher[]> {
  const resp = await api.post(`/admin/promotions/${promotionId}/vouchers`, {
    count,
    prefix,
  });
  return unwrapList<Voucher>(resp.data);
}

export async function setVoucherActive(
  voucherId: string,
  active: boolean,
): Promise<Voucher> {
  const resp = await api.patch(`/admin/promotions/vouchers/${voucherId}`, {
    active,
  });
  return unwrapOne<Voucher>(resp.data);
}

export async function importVouchers(
  promotionId: string,
  codes: string[],
): Promise<{ created: Voucher[]; skipped: string[] }> {
  const resp = await api.post(
    `/admin/promotions/${promotionId}/vouchers/import`,
    { codes },
  );
  return unwrapOne(resp.data);
}

export async function fetchPromotionAnalytics(
  promotionId: string,
): Promise<PromotionAnalytics> {
  const resp = await api.get(`/admin/promotions/${promotionId}/analytics`);
  return unwrapOne<PromotionAnalytics>(resp.data);
}

// ── A Foxer's own promotions, scoped to their own listings ────────────────

export async function fetchOwnPromotions(): Promise<Promotion[]> {
  const resp = await api.get("/promotions/mine");
  return unwrapList<Promotion>(resp.data);
}

export async function createOwnPromotion(
  payload: OwnPromotionPayload,
): Promise<Promotion> {
  const resp = await api.post("/promotions/mine", payload);
  return unwrapOne<Promotion>(resp.data);
}

export async function updateOwnPromotion(
  id: string,
  payload: Partial<OwnPromotionPayload> & { active?: boolean },
): Promise<Promotion> {
  const resp = await api.put(`/promotions/mine/${id}`, payload);
  return unwrapOne<Promotion>(resp.data);
}

export async function deleteOwnPromotion(id: string): Promise<void> {
  await api.delete(`/promotions/mine/${id}`);
}

export async function generateOwnVouchers(
  promotionId: string,
  count: number,
  prefix?: string,
): Promise<Voucher[]> {
  const resp = await api.post(`/promotions/mine/${promotionId}/vouchers`, {
    count,
    prefix,
  });
  return unwrapList<Voucher>(resp.data);
}

export async function setOwnVoucherActive(
  voucherId: string,
  active: boolean,
): Promise<Voucher> {
  const resp = await api.patch(`/promotions/mine/vouchers/${voucherId}`, {
    active,
  });
  return unwrapOne<Voucher>(resp.data);
}

export async function importOwnVouchers(
  promotionId: string,
  codes: string[],
): Promise<{ created: Voucher[]; skipped: string[] }> {
  const resp = await api.post(
    `/promotions/mine/${promotionId}/vouchers/import`,
    { codes },
  );
  return unwrapOne(resp.data);
}

export async function fetchOwnPromotionAnalytics(
  promotionId: string,
): Promise<PromotionAnalytics> {
  const resp = await api.get(`/promotions/mine/${promotionId}/analytics`);
  return unwrapOne<PromotionAnalytics>(resp.data);
}

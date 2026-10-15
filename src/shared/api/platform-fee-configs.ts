import api from "@/shared/lib/axios";

/** Mirrors `KNOWN_TRANSACTION_TYPES`/`KNOWN_CATEGORIES` in the api's
 * `src/modules/platform-fee-config/platform-fee-config.service.ts`. */
export const TRANSACTION_TYPES = ["event", "sponsorship"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const FEE_CATEGORIES = [
  "corporate",
  "birthday",
  "wedding",
  "social",
  "other",
] as const;
export type FeeCategory = (typeof FEE_CATEGORIES)[number];

export interface PlatformFeeConfig {
  id: string;
  name: string;
  transactionType: TransactionType | null;
  category: FeeCategory | null;
  subcategory: string | null;
  percentage: number | null;
  fixedAmount: number | null;
  currency: string;
  priority: number;
  active: boolean;
  effectiveFrom: string;
  effectiveUntil: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type FeeRulePayload = {
  name: string;
  transactionType?: TransactionType | null;
  category?: FeeCategory | null;
  subcategory?: string | null;
  percentage?: number | null;
  fixedAmount?: number | null;
  priority?: number;
  effectiveFrom?: string;
  effectiveUntil?: string | null;
};

function unwrapList(data: unknown): PlatformFeeConfig[] {
  const record = data as Record<string, unknown> | undefined;
  const raw = record?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

function unwrapOne(data: unknown): PlatformFeeConfig {
  const record = data as Record<string, unknown> | undefined;
  return (record?.data ?? data) as PlatformFeeConfig;
}

function unwrapNullable(data: unknown): PlatformFeeConfig | null {
  const record = data as Record<string, unknown> | undefined;
  return (record?.data ?? null) as PlatformFeeConfig | null;
}

export async function fetchPlatformFeeConfigs(
  includeInactive = false,
): Promise<PlatformFeeConfig[]> {
  const resp = await api.get("/admin/platform-fee-configs", {
    params: includeInactive ? { includeInactive: "true" } : undefined,
  });
  return unwrapList(resp.data);
}

export async function fetchPlatformFeeConfigById(
  id: string,
): Promise<PlatformFeeConfig> {
  const resp = await api.get(`/admin/platform-fee-configs/${id}`);
  return unwrapOne(resp.data);
}

export async function createPlatformFeeConfig(
  payload: FeeRulePayload,
): Promise<PlatformFeeConfig> {
  const resp = await api.post("/admin/platform-fee-configs", payload);
  return unwrapOne(resp.data);
}

export async function updatePlatformFeeConfig(
  id: string,
  payload: Partial<FeeRulePayload> & { active?: boolean },
): Promise<PlatformFeeConfig> {
  const resp = await api.put(`/admin/platform-fee-configs/${id}`, payload);
  return unwrapOne(resp.data);
}

export async function deletePlatformFeeConfig(id: string): Promise<void> {
  await api.delete(`/admin/platform-fee-configs/${id}`);
}

/** Which rule would currently win for this context — the same resolver Central Payment checkout uses. */
export async function previewPlatformFeeConfig(context: {
  transactionType: TransactionType;
  category?: FeeCategory;
  subcategory?: string;
}): Promise<PlatformFeeConfig | null> {
  const resp = await api.get("/admin/platform-fee-configs/preview", {
    params: context,
  });
  return unwrapNullable(resp.data);
}

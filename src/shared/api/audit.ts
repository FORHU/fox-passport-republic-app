import api from "@/shared/lib/axios";

/** One row of a pricing record's change history (the API's `AuditLog`). */
export interface AuditEntry {
  id: string;
  actorEmail: string;
  /** e.g. "feeRule.update", "promotion.deactivate", "voucher.setActive". */
  action: string;
  createdAt: string;
  metadata: {
    previous?: Record<string, unknown>;
    current?: Record<string, unknown>;
    code?: string;
    active?: boolean;
    codes?: string[];
    skipped?: string[];
  } | null;
}

export type AuditedResource = "platform-fee-configs" | "promotions";

/** Newest first: who changed this record, when, and from what to what. */
export async function fetchAuditHistory(
  resource: AuditedResource,
  id: string,
): Promise<AuditEntry[]> {
  const resp = await api.get(`/admin/${resource}/${id}/history`);
  const data = resp.data?.data;
  return Array.isArray(data) ? data : [];
}

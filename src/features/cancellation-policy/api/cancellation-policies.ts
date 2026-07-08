import api from "@/shared/lib/axios";

export interface CancellationRule {
  id: string;
  fromHours: number;
  toHours: number | null;
  refundPercent: number;
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  rules: CancellationRule[];
  createdAt: string;
  updatedAt: string;
}

export type CreatePolicyPayload = {
  name: string;
  description?: string;
  isDefault?: boolean;
  rules: { fromHours: number; toHours: number | null; refundPercent: number }[];
};

function unwrapList(data: unknown): CancellationPolicy[] {
  const record = data as Record<string, unknown> | undefined;
  const raw = record?.policies ?? record?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? raw : [];
}

function unwrapOne(data: unknown): CancellationPolicy {
  const record = data as Record<string, unknown> | undefined;
  return (record?.policy ?? record?.data ?? data) as CancellationPolicy;
}

export async function fetchCancellationPolicies(): Promise<CancellationPolicy[]> {
  const resp = await api.get("/cancellation-policies");
  return unwrapList(resp.data);
}

export async function fetchCancellationPolicyById(id: string): Promise<CancellationPolicy> {
  const resp = await api.get(`/cancellation-policies/${id}`);
  return unwrapOne(resp.data);
}

export async function createCancellationPolicy(payload: CreatePolicyPayload): Promise<CancellationPolicy> {
  const resp = await api.post("/cancellation-policies", payload);
  return unwrapOne(resp.data);
}

export async function updateCancellationPolicy(id: string, payload: Partial<CreatePolicyPayload>): Promise<CancellationPolicy> {
  const resp = await api.put(`/cancellation-policies/${id}`, payload);
  return unwrapOne(resp.data);
}

export async function deleteCancellationPolicy(id: string): Promise<void> {
  await api.delete(`/cancellation-policies/${id}`);
}

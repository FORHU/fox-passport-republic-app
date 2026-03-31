import api from "@/lib/axios";
import type { BackendAsset, CreateAssetPayload, Id } from "./types";

function unwrapListResponse(data: any): BackendAsset[] {
  const raw = data?.assets ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? (raw as BackendAsset[]) : [];
}

function unwrapCreateResponse(data: any): BackendAsset {
  return (data?.asset ?? data?.data ?? data) as BackendAsset;
}

export async function createAsset(payload: CreateAssetPayload): Promise<BackendAsset> {
  const resp = await api.post("/v1/assets/create", payload);
  return unwrapCreateResponse(resp.data);
}

export async function fetchAssetsByHostId(hostId: Id): Promise<BackendAsset[]> {
  const idStr = String(hostId);
  const paramAttempts: Array<Record<string, string>> = [
    { ownerId: idStr },
    { owner_id: idStr },
    { userId: idStr },
    { user_id: idStr },
    { hostId: idStr },
    { host_id: idStr },
  ];

  let lastErr: any = null;
  for (const params of paramAttempts) {
    try {
      const resp = await api.get("/v1/assets", { params });
      return unwrapListResponse(resp.data);
    } catch (e: any) {
      lastErr = e;
      const status = e?.response?.status;
      if (!status) break;
    }
  }
  throw lastErr;
}


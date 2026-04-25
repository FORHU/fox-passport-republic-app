import api from "@/lib/axios";
import type { BackendAsset, CreateAssetPayload, Id } from "./types";

function unwrapList(data: any): BackendAsset[] {
  const raw = data?.assets ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? (raw as BackendAsset[]) : [];
}

function unwrapOne(data: any): BackendAsset {
  return (data?.asset ?? data?.data ?? data) as BackendAsset;
}

export async function createAsset(payload: CreateAssetPayload): Promise<BackendAsset> {
  const resp = await api.post("/asset/create", payload);
  return unwrapOne(resp.data);
}

export async function fetchAssetsByOwnerId(ownerId: Id): Promise<BackendAsset[]> {
  const resp = await api.get("/asset", { params: { ownerId: String(ownerId) } });
  return unwrapList(resp.data);
}

export async function fetchAssetById(id: Id): Promise<BackendAsset> {
  const resp = await api.get(`/asset/${id}`);
  return unwrapOne(resp.data);
}

export async function updateAsset(assetId: Id, payload: Partial<CreateAssetPayload> & { status?: string }): Promise<BackendAsset> {
  const resp = await api.put(`/asset/${assetId}`, payload);
  return unwrapOne(resp.data);
}

export async function deleteAsset(assetId: Id): Promise<void> {
  await api.delete(`/asset/${assetId}`);
}

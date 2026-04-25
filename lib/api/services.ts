import api from "@/lib/axios";
import type { BackendService, CreateServicePayload, Id } from "./types";

function unwrapList(data: any): BackendService[] {
  const raw = data?.services ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? (raw as BackendService[]) : [];
}

function unwrapOne(data: any): BackendService {
  return (data?.service ?? data?.data ?? data) as BackendService;
}

export async function createService(payload: CreateServicePayload): Promise<BackendService> {
  const resp = await api.post("/service/create", payload);
  return unwrapOne(resp.data);
}

export async function fetchServicesByOwnerId(ownerId: Id): Promise<BackendService[]> {
  const resp = await api.get("/service", { params: { ownerId: String(ownerId) } });
  return unwrapList(resp.data);
}

export async function fetchServiceById(id: Id): Promise<BackendService> {
  const resp = await api.get(`/service/${id}`);
  return unwrapOne(resp.data);
}

export async function updateService(serviceId: Id, payload: Partial<CreateServicePayload> & { status?: string }): Promise<BackendService> {
  const resp = await api.put(`/service/${serviceId}`, payload);
  return unwrapOne(resp.data);
}

export async function deleteService(serviceId: Id): Promise<void> {
  await api.delete(`/service/${serviceId}`);
}

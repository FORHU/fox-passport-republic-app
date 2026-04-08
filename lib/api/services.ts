import api from "@/lib/axios";
import type { BackendService, CreateServicePayload, Id } from "./types";

function unwrapListResponse(data: any): BackendService[] {
  const raw = data?.services ?? data?.data ?? (Array.isArray(data) ? data : []);
  return Array.isArray(raw) ? (raw as BackendService[]) : [];
}

function unwrapCreateResponse(data: any): BackendService {
  return (data?.service ?? data?.data ?? data) as BackendService;
}

export async function createService(payload: CreateServicePayload): Promise<BackendService> {
  const resp = await api.post("/services/create", payload);
  return unwrapCreateResponse(resp.data);
}

export async function fetchServices(): Promise<BackendService[]> {
  const resp = await api.get("/services");
  return unwrapListResponse(resp.data);
}

export async function fetchServicesByHostId(hostId: Id): Promise<BackendService[]> {
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
      const resp = await api.get("/services", { params });
      return unwrapListResponse(resp.data);
    } catch (e: any) {
      lastErr = e;
      const status = e?.response?.status;
      if (!status) break;
    }
  }

  const all = await fetchServices();
  return all.filter((s) => String(s.hostId ?? "") === idStr);
}

function unwrapUpdateResponse(data: any): BackendService {
  return (data?.service ?? data?.data ?? data) as BackendService;
}

export type UpdateServicePayload = CreateServicePayload & {
  status?: string;
};

export async function updateService(
  serviceId: Id,
  payload: UpdateServicePayload
): Promise<BackendService> {
  const resp = await api.put(`/services/${serviceId}`, payload);
  return unwrapUpdateResponse(resp.data);
}


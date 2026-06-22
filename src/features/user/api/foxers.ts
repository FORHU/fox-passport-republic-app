import api from "@/shared/lib/axios";

export interface FoxerService {
  id: string;
  name: string;
  category: string;
  price: number;
  billingRate: string;
  tags: string[];
  description?: string;
  images: { url: string }[];
}

export interface FoxerEventTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  targetCity?: string;
  targetState?: string;
  images: { url: string }[];
}

export interface Foxer {
  id: string;
  name: string;
  imgId?: string | null;
  city?: string | null;
  state?: string | null;
  roleType?: string[];
  createdAt: string;
  services: FoxerService[];
  eventTemplates?: FoxerEventTemplate[];
}

export async function fetchFoxers(limit = 9, page = 1, roleType?: string): Promise<Foxer[]> {
  const params: Record<string, any> = { limit, page };
  if (roleType) params.roleType = roleType;
  const res = await api.get("/users/foxers", { params });
  return res.data?.data ?? [];
}

export async function fetchFoxerById(id: string): Promise<Foxer> {
  const res = await api.get(`/users/foxers/${id}`);
  return res.data?.data;
}

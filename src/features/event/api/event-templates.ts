export * from "@/shared/api/event-templates";

import api from "@/shared/lib/axios";
import { EventTemplate } from "@/shared/api/event-templates";

export interface TemplateResource {
  id: string;
  name: string;
  category: string;
  price: number;
  billingRate: string;
  images: { url: string }[];
  ownerId: string;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
}

export interface EventTemplateDetail extends EventTemplate {
  status?: string;
  cancellationPolicyId?: string | null;
  lat?: number | null;
  lng?: number | null;
  date?: string | null;
  templateVenues?: {
    venue: TemplateResource & { mayorId?: string };
  }[];
  templateAssets?: { asset: TemplateResource }[];
  templateServices?: { service: TemplateResource }[];
}

export async function fetchEventTemplateById(
  id: string,
): Promise<EventTemplateDetail> {
  const res = await api.get(`/event-templates/${id}`);
  return res.data?.template ?? res.data?.data ?? res.data;
}

import api from "@/shared/lib/axios";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  targetCity?: string;
  targetState?: string;
  targetCountry?: string;
  createdAt: string;
  images: { id: string; url: string; name: string }[];
  templateVenues?: { venue?: { city?: string; price?: number } }[];
  owner?: { id: string; name: string };
  maxAttendees?: number | null;
  currentAttendees?: number;
  estimatedTotal?: number;
  // The platform fee already inside estimatedTotal (API calculateTotalsBreakdown).
  platformFeeAmount?: number;
}

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

export async function fetchTrendingTemplates(
  category?: string,
  limit = 8,
): Promise<EventTemplate[]> {
  const params: Record<string, string | number> = { limit };
  if (category) params.category = category;
  const res = await api.get("/event-templates/browse", { params });
  const raw = res.data?.data ?? res.data?.templates ?? [];
  return Array.isArray(raw) ? raw : [];
}

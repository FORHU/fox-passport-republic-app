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

export async function fetchTrendingTemplates(
  category?: string,
  limit = 8,
  city?: string,
): Promise<EventTemplate[]> {
  const params: Record<string, string | number> = { limit };
  if (category) params.category = category;
  if (city) params.city = city;
  const res = await api.get("/event-templates/browse", { params });
  const raw = res.data?.data ?? res.data?.templates ?? [];
  return Array.isArray(raw) ? raw : [];
}

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
  city?: string,
): Promise<EventTemplate[]> {
  const params: Record<string, string | number> = { limit };
  if (category) params.category = category;
  if (city) params.city = city;
  const res = await api.get("/event-templates/browse", { params });
  const raw = res.data?.data ?? res.data?.templates ?? [];
  return Array.isArray(raw) ? raw : [];
}

/**
 * One entry of a package's History (GET /event-templates/:id/history): an
 * edit, an item added or removed, or a booking. People are names only; the
 * API never returns emails here.
 */
export interface PackageHistoryEntry {
  id: string;
  at: string;
  /** package.edit · package.item.add|remove · booking.created|paid|checkedIn|cancelled */
  action: string;
  actor: { id: string; name: string | null };
  changes?: Record<string, { from: unknown; to: unknown }>;
  kind?: "asset" | "service" | "venue";
  itemId?: string;
  itemName?: string | null;
  description?: string;
  bookingId?: string;
  guestCount?: number;
  startAt?: string;
  /** booking.paid: what the guest paid, in the platform currency. */
  amount?: number;
  refunded?: boolean;
  /** Settled by an admin's review of an Event nobody was checked in to. */
  byReview?: boolean;
  noShow?: boolean;
}

/** Newest first. Only the package's owner may read it. */
export async function fetchPackageHistory(
  templateId: string,
): Promise<PackageHistoryEntry[]> {
  const resp = await api.get(`/event-templates/${templateId}/history`);
  const data = resp.data?.data;
  return Array.isArray(data) ? data : [];
}

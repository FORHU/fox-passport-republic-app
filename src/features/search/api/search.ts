import api from "@/shared/lib/axios";
import type { Foxer } from "@/shared/api/foxers";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SectionResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface UnifiedSearchFilters {
  city?: string;
  category?: string;
  maxPrice?: string;
  q?: string;
}

export interface ProviderRow {
  foxerId: string;
  name: string;
  itemName: string;
  category: string;
  price: number;
  billingRate: string;
  img?: string;
}

export async function fetchEventFoxers(
  page = 1,
  limit = 6,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<Foxer>> {
  const params: Record<string, any> = { page, limit, roleType: "eventFoxer" };
  if (filters?.city) params.city = filters.city;
  if (filters?.category) params.specialization = filters.category;
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters?.q) params.q = filters.q;
  const res = await api.get("/users/foxers", { params });
  const body = res.data ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchEventTemplates(
  page = 1,
  limit = 6,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<any>> {
  const params: Record<string, any> = { page, limit };
  if (filters?.city) params.city = filters.city;
  if (filters?.category) params.category = filters.category;
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters?.q) params.q = filters.q;
  const res = await api.get("/event-templates/browse", { params });
  const body = res.data ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

function itemsToRows(items: any[]): ProviderRow[] {
  return items.map((item) => ({
    foxerId: item.owner?.id,
    name: item.owner?.name,
    itemName: item.name,
    category: item.category,
    price: item.price,
    billingRate: item.billingRate,
    img: item.images?.[0]?.url,
  }));
}

// Item-level pagination (one row per asset/service) so every page holds exactly
// `limit` rows, instead of paginating over Foxers and nesting up to 3 items each
// — which left pages with an inconsistent, often mostly-empty item count.
export async function fetchGearFoxers(
  page = 1,
  limit = 10,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<ProviderRow>> {
  const params: Record<string, any> = { page, limit };
  if (filters?.city) params.city = filters.city;
  // Gear Foxer specializations are keyed by asset category (e.g. "sound_system"),
  // not event vibe, so the vibe filter doesn't apply here.
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  const res = await api.get("/asset/browse", { params });
  const body = res.data ?? {};
  return {
    items: itemsToRows(Array.isArray(body.data) ? body.data : []),
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchServiceFoxers(
  page = 1,
  limit = 10,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<ProviderRow>> {
  const params: Record<string, any> = { page, limit };
  if (filters?.city) params.city = filters.city;
  // Service Foxer specializations are keyed by service category (e.g. "catering"),
  // not event vibe, so the vibe filter doesn't apply here.
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  const res = await api.get("/service/browse", { params });
  const body = res.data ?? {};
  return {
    items: itemsToRows(Array.isArray(body.data) ? body.data : []),
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export interface AllSearchSections {
  eventFoxers: SectionResult<Foxer>;
  eventTemplates: SectionResult<any>;
  gearFoxers: SectionResult<ProviderRow>;
  serviceFoxers: SectionResult<ProviderRow>;
}

export async function fetchAllSearchSections(
  page: number,
  filters?: UnifiedSearchFilters,
  limits?: {
    eventFoxers?: number;
    eventTemplates?: number;
    gearFoxers?: number;
    serviceFoxers?: number;
  },
): Promise<AllSearchSections> {
  const [ef, et, gf, sf] = await Promise.all([
    fetchEventFoxers(page, limits?.eventFoxers ?? 6, filters),
    fetchEventTemplates(page, limits?.eventTemplates ?? 6, filters),
    fetchGearFoxers(page, limits?.gearFoxers ?? 10, filters),
    fetchServiceFoxers(page, limits?.serviceFoxers ?? 10, filters),
  ]);
  return {
    eventFoxers: ef,
    eventTemplates: et,
    gearFoxers: gf,
    serviceFoxers: sf,
  };
}

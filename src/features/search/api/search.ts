import api from "@/shared/lib/axios";
import type { Foxer } from "@/features/user/api/foxers";

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
  startDate?: string;
  endDate?: string;
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

export function foxersToRows(
  foxers: Foxer[],
  source: "services" | "assets" = "services",
): ProviderRow[] {
  const rows: ProviderRow[] = [];
  foxers.forEach((f) => {
    const items = source === "assets" ? (f.assets ?? []) : f.services;
    items.forEach((item) => {
      rows.push({
        foxerId: f.id,
        name: f.name,
        itemName: item.name,
        category: item.category,
        price: item.price,
        billingRate: item.billingRate,
        img: item.images?.[0]?.url,
      });
    });
  });
  return rows;
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
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
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
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  const res = await api.get("/event-templates/browse", { params });
  const body = res.data ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchGearFoxers(
  page = 1,
  limit = 10,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<Foxer>> {
  const params: Record<string, any> = { page, limit, roleType: "gearFoxer" };
  if (filters?.city) params.city = filters.city;
  // Gear Foxer specializations are keyed by asset category (e.g. "sound_system"),
  // not event vibe, so the vibe filter doesn't apply here.
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters?.q) params.q = filters.q;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  const res = await api.get("/users/foxers", { params });
  const body = res.data ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchServiceFoxers(
  page = 1,
  limit = 10,
  filters?: UnifiedSearchFilters,
): Promise<SectionResult<Foxer>> {
  const params: Record<string, any> = { page, limit, roleType: "serviceFoxer" };
  if (filters?.city) params.city = filters.city;
  // Service Foxer specializations are keyed by service category (e.g. "catering"),
  // not event vibe, so the vibe filter doesn't apply here.
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters?.q) params.q = filters.q;
  if (filters?.startDate) params.startDate = filters.startDate;
  if (filters?.endDate) params.endDate = filters.endDate;
  const res = await api.get("/users/foxers", { params });
  const body = res.data ?? {};
  return {
    items: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export interface AllSearchSections {
  eventFoxers: SectionResult<Foxer>;
  eventTemplates: SectionResult<any>;
  gearFoxers: SectionResult<Foxer>;
  serviceFoxers: SectionResult<Foxer>;
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

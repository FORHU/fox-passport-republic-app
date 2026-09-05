import api from "@/shared/lib/axios";

export type InvestmentType =
  | "physical_inventory"
  | "financial_capital"
  | "venue_equity"
  | "event_sponsorship";

export type InventoryCategory =
  | "furniture_seating"
  | "tables_staging"
  | "audio_visual"
  | "lighting_rigging"
  | "power_climate"
  | "decor_props"
  | "other";

export type TransportPolicy =
  "self_pickup" | "partner_delivers_free" | "partner_delivers_fee";

export interface PartnerInvestment {
  id: string;
  partnerId: string;
  type: InvestmentType;
  title: string;
  description: string;
  inventoryCategory?: InventoryCategory | null;
  quantityTotal?: number | null;
  quantityAvailable?: number | null;
  itemCondition?: string | null;
  monetaryValue: number;
  usageTerms?: string | null;
  dailyRentalRate?: number | null;
  revenueSharePercent?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  deliveryRadiusKm?: number | null;
  transportPolicy?: TransportPolicy | null;
  targetVenueId?: string | null;
  targetEventId?: string | null;
  status: string;
  mediaUrls: string[];
  createdAt: string;
  distanceKm?: number;
  withinDeliveryRadius?: boolean;
  partner?: {
    id: string;
    name: string;
    username?: string | null;
    imgId?: string | null;
    city?: string | null;
    country?: string | null;
  };
  targetVenue?: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export interface CreateInvestmentPayload {
  type: InvestmentType;
  title: string;
  description: string;
  inventoryCategory?: InventoryCategory;
  quantityTotal?: number;
  itemCondition?: string;
  monetaryValue: number;
  usageTerms?: string;
  dailyRentalRate?: number;
  revenueSharePercent?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  deliveryRadiusKm?: number;
  transportPolicy?: TransportPolicy;
  targetVenueId?: string;
  targetEventId?: string;
  mediaUrls?: string[];
  broadcastToFeed?: boolean;
}

export async function createInvestment(
  payload: CreateInvestmentPayload,
): Promise<PartnerInvestment> {
  const res = await api.post("/investments", payload);
  return res.data?.data;
}

export async function fetchInvestments(params?: {
  type?: InvestmentType;
  category?: InventoryCategory;
  partnerId?: string;
  country?: string;
  limit?: number;
  page?: number;
}): Promise<{ investments: PartnerInvestment[]; total: number }> {
  const res = await api.get("/investments", { params });
  return {
    investments: res.data?.data ?? [],
    total: res.data?.pagination?.total ?? 0,
  };
}

export async function fetchInvestmentsOnMap(params?: {
  type?: InvestmentType;
  category?: InventoryCategory;
  country?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}): Promise<PartnerInvestment[]> {
  const res = await api.get("/investments/map", { params });
  return res.data?.data ?? [];
}

export async function fetchNearbyInventoryForVenue(
  venueId: string,
  category?: InventoryCategory,
  radius?: number,
): Promise<PartnerInvestment[]> {
  const res = await api.get(`/investments/nearby-for-venue/${venueId}`, {
    params: { category, radius },
  });
  return res.data?.data ?? [];
}

export async function fetchInvestmentById(
  id: string,
): Promise<PartnerInvestment> {
  const res = await api.get(`/investments/${id}`);
  return res.data?.data;
}

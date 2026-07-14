"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

// ─── Types matching what ExperienceBuilder renders ────────────────────────────

export interface LiveFoxer {
  id: string;
  name: string;
  role: string;
  fee: number;
  rating: number;
  avatar: string;
  description: string;
}

export interface LiveService {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
  category: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

interface ApiUser {
  id: string;
  name?: string;
  username?: string;
  roleType?: string;
  imgId?: string;
  bio?: string;
  services?: { price: number }[];
  assets?: { price: number }[];
}

interface ApiService {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface ApiAsset {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

// ─── Category icon map ─────────────────────────────────────────────────────────

const SERVICE_CATEGORY_ICON: Record<string, string> = {
  entertainment: "music_note",
  catering: "restaurant",
  design: "palette",
  service_staff: "groups",
  other: "star",
};

const ASSET_CATEGORY_ICON: Record<string, string> = {
  sound_system: "speaker",
  decorations: "palette",
  furnitures: "chair",
  lighting: "light_mode",
  av_equipment: "videocam",
  other: "category",
};

// Maps API service.category → sidebar tab id
const SERVICE_CAT_TO_TAB: Record<string, string> = {
  entertainment: "media",
  catering: "catering",
  design: "decor",
  service_staff: "catering",
  other: "catering",
};

// Maps API asset.category → sidebar tab id
const ASSET_CAT_TO_TAB: Record<string, string> = {
  sound_system: "tech",
  decorations: "decor",
  furnitures: "decor",
  lighting: "tech",
  av_equipment: "tech",
  other: "tech",
};

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchFoxers(): Promise<LiveFoxer[]> {
  const res = await api.get("/users?roleType=serviceFoxer,gearFoxer");
  const users: ApiUser[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return users.map((u) => {
    const priceList = [...(u.services ?? []), ...(u.assets ?? [])].map((i) => i.price).filter((p) => p > 0);
    const fee = priceList.length > 0 ? Math.min(...priceList) : 0;
    return {
      id: u.id,
      name: u.name || u.username || "Foxer",
      role: u.roleType?.includes("serviceFoxer") ? "Talent Foxer" : "Gear Foxer",
      fee,
      rating: 0,
      avatar:
        u.imgId ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "Foxer")}&background=ccff00&color=000`,
      description: u.bio || "Available for custom event curation.",
    };
  });
}

async function fetchServices(): Promise<LiveService[]> {
  const res = await api.get("/service");
  const services: ApiService[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    icon: SERVICE_CATEGORY_ICON[s.category] ?? "star",
    desc: s.description ?? "",
    category: SERVICE_CAT_TO_TAB[s.category] ?? "catering",
  }));
}

async function fetchAssets(): Promise<LiveService[]> {
  const res = await api.get("/asset");
  const assets: ApiAsset[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  return assets.map((a) => ({
    id: a.id,
    name: a.name,
    price: a.price,
    icon: ASSET_CATEGORY_ICON[a.category] ?? "category",
    desc: a.description ?? "",
    category: ASSET_CAT_TO_TAB[a.category] ?? "tech",
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExperienceBuilderData() {
  const { data: foxers = [], isLoading: loadingFoxers } = useQuery<LiveFoxer[]>({
    queryKey: ["experience-builder-foxers"],
    queryFn: fetchFoxers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery<LiveService[]>({
    queryKey: ["experience-builder-services"],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });

  const { data: assets = [], isLoading: loadingAssets } = useQuery<LiveService[]>({
    queryKey: ["experience-builder-assets"],
    queryFn: fetchAssets,
    staleTime: 1000 * 60 * 5,
  });

  // Merge services + assets into one flat pool, keyed by sidebar tab
  const allItems: LiveService[] = [...services, ...assets];

  // Group by sidebar category tab (same shape CUSTOM_SERVICES had)
  const itemsByCategory: Record<string, LiveService[]> = {};
  for (const item of allItems) {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  }

  return {
    foxers,
    itemsByCategory,
    isLoading: loadingFoxers || loadingServices || loadingAssets,
  };
}
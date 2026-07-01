"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

type EndpointConfig = { path: string; extractKey: string };

const ENDPOINTS: Record<string, EndpointConfig> = {
  event_template: { path: "/event-templates", extractKey: "templates" },
  venue: { path: "/venues", extractKey: "venues" },
  service: { path: "/service", extractKey: "services" },
  asset: { path: "/asset", extractKey: "assets" },
};

const PROS_TYPES = ["venue", "service", "asset"] as const;

function extractList(body: any, extractKey: string): any[] {
  const list = body?.[extractKey] ?? body?.data ?? [];
  return Array.isArray(list) ? list : [];
}

export const useSearch = () => {
  const searchParams = useSearchParams();

  const type = searchParams?.get("type") || "event_template";
  const city = searchParams?.get("city") || "";
  const category = searchParams?.get("category") || "";
  const minPrice = searchParams?.get("minPrice") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";
  const q = searchParams?.get("q") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", type, city, category, minPrice, maxPrice, q],
    queryFn: async () => {
      let results: any[] = [];

      if (type === "pros") {
        const fetched = await Promise.all(
          PROS_TYPES.map(async (t) => {
            const ep = ENDPOINTS[t];
            try {
              const res = await api.get(ep.path);
              return extractList(res.data, ep.extractKey);
            } catch {
              return [];
            }
          }),
        );
        results = fetched.flat();
      } else {
        const ep = ENDPOINTS[type];
        if (!ep) return [];
        try {
          const res = await api.get(ep.path);
          results = extractList(res.data, ep.extractKey);
        } catch {
          return [];
        }
      }

      results = results.filter((item) => {
        
        const itemCity = item.city || item.targetCity || "";
        if (city && !itemCity.toLowerCase().includes(city.trim().toLowerCase())) return false;

        
        const itemCategory = item.category || item.categoryName || item.type || "";
        if (category && itemCategory.toLowerCase().trim() !== category.toLowerCase().trim()) return false;

        
        if (q) {
          const haystack = `${item.name || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
          if (!haystack.includes(q.trim().toLowerCase())) return false;
        }

        // Price range
        const p = Number(item.price);
        if (minPrice && p < Number(minPrice)) return false;
        if (maxPrice && p > Number(maxPrice)) return false;

        return true;
      });

      return results;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    type,
  };
};
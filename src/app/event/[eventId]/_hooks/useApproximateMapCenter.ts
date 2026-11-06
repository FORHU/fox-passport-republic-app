"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "@/shared/api/geo";
import { mapboxGeocode } from "@/shared/lib/geocoding";

/**
 * An event without map coordinates (no venue pin and no template lat/lng)
 * can still have a city. Geocode it so the page can show the area. Resolves
 * to null when the city or its country isn't found, there is no Mapbox token,
 * or Mapbox errors, so the page falls back to the city text alone.
 */
export function useApproximateMapCenter({
  city,
  state,
  country,
  enabled,
}: {
  city?: string | null;
  state?: string | null;
  /** A country name ("Philippines"), as templates store it, or an ISO code. */
  country?: string | null;
  enabled: boolean;
}): { lat: number; lng: number } | null {
  const wanted = enabled && !!city && !!country;

  // Mapbox needs an ISO code in `country=`: without it, "La Union, La Union,
  // Philippines" resolved to La Unión in El Salvador. Same query (and cache
  // entry) as the location pickers.
  const { data: countries } = useQuery({
    queryKey: ["geo", "countries"],
    queryFn: fetchCountries,
    enabled: wanted,
    staleTime: Infinity,
  });
  const name = country?.trim().toLowerCase();
  const countryCode = countries?.find(
    (c) => c.name.toLowerCase() === name || c.code.toLowerCase() === name,
  )?.code;

  const query = [city, state].filter(Boolean).join(", ");
  const { data } = useQuery({
    queryKey: ["approx-map-center", query, countryCode],
    queryFn: async () => {
      const [hit] = await mapboxGeocode(query, {
        types: "place,locality,district,region",
        country: countryCode,
        limit: 1,
      });
      return hit ? { lat: hit.center[1], lng: hit.center[0] } : null;
    },
    enabled: wanted && !!countryCode,
    staleTime: Infinity,
    retry: false,
  });

  return wanted && countryCode ? (data ?? null) : null;
}

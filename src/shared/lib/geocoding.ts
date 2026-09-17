import { config } from "@/shared/lib/config";

interface MapboxFeature {
  text: string;
}

async function searchPlacesInCountry(
  query: string,
  countryCode: string,
  type: "place" | "region",
): Promise<string[]> {
  if (!config.mapboxToken) return [];
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query,
    )}.json?access_token=${config.mapboxToken}&types=${type}&country=${countryCode}&limit=8`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return ((data.features as MapboxFeature[]) || []).map((f) => f.text);
}

/** Live city search scoped to a country — used when no curated static city list exists for it. */
export function searchCitiesInCountry(query: string, countryCode: string) {
  return searchPlacesInCountry(query, countryCode, "place");
}

/** Live state/province search scoped to a country — used when no curated static list exists for it. */
export function searchRegionsInCountry(query: string, countryCode: string) {
  return searchPlacesInCountry(query, countryCode, "region");
}

/** Rough center point for a country, e.g. to recenter a map after picking one. */
export async function geocodeCountryCenter(
  countryCode: string,
): Promise<[number, number] | null> {
  if (!config.mapboxToken) return null;
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${countryCode}.json?access_token=${config.mapboxToken}&types=country&limit=1`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  const center = data.features?.[0]?.center;
  return Array.isArray(center) ? (center as [number, number]) : null;
}

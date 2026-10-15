import { config } from "@/shared/lib/config";

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

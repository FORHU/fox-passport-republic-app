import { getEffectiveMapboxToken } from "@/shared/lib/mapbox";

/**
 * The one place the app builds a Mapbox Geocoding request. Every place search,
 * reverse lookup and map recentre goes through `mapboxGeocode`, so filters
 * like `country=` are applied the same way everywhere - a hand-built copy of
 * this URL is how MO (Macau) once resolved to Morocco.
 */

/** A Mapbox Geocoding v5 feature - the fields the app reads. */
export interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  place_type: string[];
  center: [number, number];
  bbox?: [number, number, number, number];
  context?: { id: string; text: string; short_code?: string }[];
  properties?: { short_code?: string };
}

export interface GeocodeOptions {
  /** Mapbox place types, e.g. "place,locality". */
  types?: string;
  /** ISO 3166 alpha-2 code; limits results to that country. */
  country?: string;
  limit?: number;
  /** Bias results towards this [lng, lat]. */
  proximity?: [number, number];
  /** Only results inside [minLng, minLat, maxLng, maxLat]. */
  bbox?: [number, number, number, number];
  autocomplete?: boolean;
  signal?: AbortSignal;
}

/**
 * Forward search (a text query) or reverse lookup (a [lng, lat] pair).
 * Resolves to no features when there is no token or Mapbox answers with an
 * error; an aborted request rejects with the usual `AbortError`.
 */
export async function mapboxGeocode(
  query: string | [number, number],
  options: GeocodeOptions = {},
): Promise<MapboxFeature[]> {
  const token = getEffectiveMapboxToken();
  const search = typeof query === "string" ? query.trim() : query.join(",");
  if (!token || !search) return [];

  const params = new URLSearchParams({ access_token: token });
  if (options.types) params.set("types", options.types);
  if (options.country) params.set("country", options.country.toLowerCase());
  if (options.limit) params.set("limit", String(options.limit));
  if (options.proximity) params.set("proximity", options.proximity.join(","));
  if (options.bbox) params.set("bbox", options.bbox.join(","));
  if (options.autocomplete !== undefined) {
    params.set("autocomplete", String(options.autocomplete));
  }

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?${params}`,
    { signal: options.signal },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.features) ? data.features : [];
}

/** Rough center point for a country, e.g. to recenter a map after picking one. */
export async function geocodeCountryCenter(
  countryCode: string,
): Promise<[number, number] | null> {
  // `country=` pins the match: searching the bare code as text sent MO
  // (Macau) to Morocco, GE (Georgia) to Germany and GU (Guam) to Guyana.
  const [hit] = await mapboxGeocode(countryCode, {
    types: "country",
    country: countryCode,
    limit: 1,
  });
  return hit?.center ?? null;
}

/**
 * Place names matching what was typed, for a city picker: e.g. "Vlas" →
 * ["Vlašim"] inside a Czech district the bundled dataset has no cities for.
 */
export async function suggestPlaces(
  query: string,
  countryCode: string,
  bbox?: [number, number, number, number],
): Promise<string[]> {
  if (query.trim().length < 2) return [];
  const features = await mapboxGeocode(query, {
    types: "place,locality,district",
    country: countryCode,
    autocomplete: true,
    limit: 6,
    bbox,
  });
  return [...new Set(features.map((f) => f.text).filter(Boolean))];
}

/** A Mapbox match: its center and, for an area, its bounding box. */
export interface GeoMatch {
  center: [number, number];
  bbox?: [number, number, number, number];
}

/**
 * A province, city or barangay inside one country. Pass `bbox` (e.g. the
 * province's) to keep a same-named place elsewhere from winning: the
 * Philippines has a "Little Baguio" in Mindanao as well as Baguio in Benguet.
 */
export async function geocodePlace(
  query: string,
  countryCode: string,
  types: string,
  bbox?: [number, number, number, number],
): Promise<GeoMatch | null> {
  const [hit] = await mapboxGeocode(query, {
    types,
    country: countryCode,
    limit: 1,
    bbox,
  });
  return hit ? { center: hit.center, bbox: hit.bbox } : null;
}

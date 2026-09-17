import { MAJOR_CITIES } from "@/shared/data/majorCities";
import { CITY_DATA_BY_COUNTRY } from "@/shared/data/usEuropeCities";
import { PH_PROVINCES } from "@/shared/data/location";

// Curated static city lists we actually have data for: the Philippines plus
// the US and core European markets. Any other country falls back to live
// Mapbox place search scoped to the chosen country.
export const STATIC_CITY_LISTS: Record<string, string[]> = {
  Philippines: MAJOR_CITIES,
  ...CITY_DATA_BY_COUNTRY,
};

// Shown when no country is picked yet, so a "city" field doesn't silently
// behave like one specific country was already selected.
export const ALL_STATIC_CITIES = Array.from(
  new Set(Object.values(STATIC_CITY_LISTS).flat()),
).sort();

// Curated static state/province lists. Only the Philippines has one today —
// every other country falls back to live Mapbox region search scoped to the
// chosen country.
export const STATIC_REGION_LISTS: Record<string, string[]> = {
  Philippines: PH_PROVINCES,
};

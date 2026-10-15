import api from "@/shared/lib/axios";

export interface GeoCountry {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  currency: string;
}

export interface GeoState {
  code: string;
  name: string;
}

export interface GeoPlace {
  countryCode: string;
  stateCode: string | null;
  stateName: string | null;
  city: string;
}

// Country → state → city reference data, served by the API from a bundled
// dataset (see the API's GeoDirectory) — no geocoder or token involved.

export async function fetchCountries(): Promise<GeoCountry[]> {
  const res = await api.get("/locations/countries");
  return res.data?.data ?? [];
}

export async function fetchStates(countryCode: string): Promise<GeoState[]> {
  const res = await api.get(`/locations/countries/${countryCode}/states`);
  return res.data?.data ?? [];
}

/** A state's cities — or the whole country's when `stateCode` is omitted. */
export async function fetchCities(
  countryCode: string,
  stateCode?: string,
): Promise<string[]> {
  const res = await api.get(`/locations/countries/${countryCode}/cities`, {
    params: stateCode ? { state: stateCode } : undefined,
  });
  return res.data?.data ?? [];
}

/** The nearest known city to a point — for "use my location". */
export async function fetchNearestPlace(
  lat: number,
  lng: number,
): Promise<GeoPlace | null> {
  const res = await api.get("/locations/nearest", { params: { lat, lng } });
  return res.data?.data ?? null;
}

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

/**
 * Sent with every list request so a browser's HTTP cache (the API allows a
 * day) can't serve lists from before a data change. Bump it whenever the
 * API's location data changes. 2: the Philippines moved to the PSGC list,
 * whose province codes differ - a cached old list asked for Abra as "ABR"
 * and got no cities.
 */
const GEO_DATA_VERSION = "2";

export async function fetchCountries(): Promise<GeoCountry[]> {
  const res = await api.get("/locations/countries");
  return res.data?.data ?? [];
}

/** One accepted TIN format of a country — see the API's utils/tax-id-formats. */
export interface TinFormat {
  label: string;
  /** react-imask pattern: `0` digit, `a` letter, `*` either; "" = no mask. */
  mask: string;
  example: string;
  /** Regex source, on the value uppercased without spaces; groups = compact. */
  pattern: string;
  /** Stricter regex source on the compact value, or null. */
  rule: string | null;
}

export interface TinFormats {
  /** false where the country issues no TIN: the field is optional there. */
  issuesTin: boolean;
  /** The API's message for a TIN that fits none of the formats. */
  message: string;
  formats: TinFormat[];
}

/** Bump with any change to the API's TIN table (the API caches it a day). */
const TIN_DATA_VERSION = "1";

export async function fetchTinFormats(
  countryCode: string,
): Promise<TinFormats> {
  const res = await api.get(`/locations/countries/${countryCode}/tin-formats`, {
    params: { v: TIN_DATA_VERSION },
  });
  return res.data?.data;
}

export async function fetchStates(countryCode: string): Promise<GeoState[]> {
  const res = await api.get(`/locations/countries/${countryCode}/states`, {
    params: { v: GEO_DATA_VERSION },
  });
  return res.data?.data ?? [];
}

/** A state's cities — or the whole country's when `stateCode` is omitted. */
export async function fetchCities(
  countryCode: string,
  stateCode?: string,
): Promise<string[]> {
  const res = await api.get(`/locations/countries/${countryCode}/cities`, {
    params: {
      v: GEO_DATA_VERSION,
      ...(stateCode && { state: stateCode }),
    },
  });
  return res.data?.data ?? [];
}

/**
 * A Philippine city's barangays (PSGC). `state` is the province name or code.
 * Empty for any other country.
 */
export async function fetchBarangays(
  countryCode: string,
  state: string,
  city: string,
): Promise<string[]> {
  const res = await api.get(`/locations/countries/${countryCode}/barangays`, {
    params: { v: GEO_DATA_VERSION, state, city },
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

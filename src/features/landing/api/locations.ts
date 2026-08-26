import api from "@/shared/lib/axios";

interface LocationSearchResponse {
  status: string;
  data?: { locations?: string[] };
}

/**
 * Location suggestions for the landing-page search field.
 *
 * Returns [] rather than throwing on an unexpected payload: this drives a
 * type-ahead, where showing no suggestions is a reasonable outcome and an
 * exception is not. Network and auth failures still reject, so callers can tell
 * "nothing matched" apart from "the request failed".
 */
export const searchLocations = async (
  query: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  const { data } = await api.get<LocationSearchResponse>("/locations/search", {
    params: { q: query },
    signal,
  });

  if (data?.status !== "success") return [];
  return data.data?.locations ?? [];
};

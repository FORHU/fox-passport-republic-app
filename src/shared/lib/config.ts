export const config = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:6002/api/v1",
};

/**
 * The backend origin, as reachable from *this* browser right now — unlike
 * `config.apiUrl`, which is a single value inlined into the JS bundle at
 * build time. A phone on the LAN loads the app at e.g.
 * `http://192.168.1.34:6001`; `config.apiUrl` still says `localhost:6002`
 * regardless, which the phone can't resolve to anything useful. The API
 * always runs on port 6002 on whatever host served this page, so deriving
 * it from `window.location` works for localhost, the LAN IP, or a real
 * domain without needing a rebuild per environment.
 *
 * Only needed for the handful of places the browser talks to the API
 * directly instead of through `/api/proxy` (same-origin, so it never has
 * this problem) — chiefly the Google OAuth links, which must be a real
 * cross-origin URL since they're a full-page navigation, not a fetch.
 */
export function getBrowserApiUrl(): string {
  if (typeof window === "undefined") return config.apiUrl;
  return `${window.location.protocol}//${window.location.hostname}:6002/api/v1`;
}

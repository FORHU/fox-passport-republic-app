import { config } from "./config";

/**
 * High-definition CartoDB Dark Matter tile style as fallback.
 * Standard 256px raster tiles.
 */
export const CARTO_DARK_STYLE: any = {
  version: 8,
  name: "FoxPassport Dark Matter",
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/**
 * Returns the configured Mapbox access token, or "" if none is set —
 * callers fall back to the Carto Dark tile style in that case.
 */
export function getEffectiveMapboxToken(): string {
  return config.mapboxToken?.trim() || "";
}

/**
 * Returns the appropriate map style.
 * Uses official Mapbox dark-v11 vector style with crisp roads, labels, and landmarks.
 */
export function getMapStyle(): string | object {
  const token = getEffectiveMapboxToken();
  if (token) {
    return "mapbox://styles/mapbox/dark-v11";
  }
  return CARTO_DARK_STYLE;
}

/**
 * Attaches an error handler to smoothly swap to Carto Dark if Mapbox returns 401/403.
 */
export function setupMapboxFallback(map: any): void {
  if (!map) return;
  map.on("error", (e: any) => {
    const status = e?.error?.status || e?.status;
    const msg = e?.error?.message || e?.message || "";
    if (
      status === 401 ||
      status === 403 ||
      msg.includes("Not Authorized") ||
      msg.includes("Token") ||
      msg.includes("Forbidden")
    ) {
      console.warn(
        "Mapbox style authorization failed — switching to high-definition dark tile provider",
      );
      try {
        map.setStyle(CARTO_DARK_STYLE);
      } catch (err) {
        console.warn("Could not set fallback style:", err);
      }
    }
  });
}

import { config } from "./config";
import { useMapThemeStore } from "@/shared/store/useMapThemeStore";

export type MapTheme = "dark" | "light";

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** CartoDB raster basemap (Dark Matter / Positron), standard 256px tiles. */
function cartoStyle(theme: MapTheme): any {
  const variant = theme === "dark" ? "dark_all" : "light_all";
  return {
    version: 8,
    name: theme === "dark" ? "FoxPassport Dark Matter" : "FoxPassport Positron",
    sources: {
      [`carto-${theme}`]: {
        type: "raster",
        tiles: ["a", "b", "c"].map(
          (sub) =>
            `https://${sub}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
        ),
        tileSize: 256,
        attribution: CARTO_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: `carto-${theme}-layer`,
        type: "raster",
        source: `carto-${theme}`,
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };
}

/** High-definition CartoDB Dark Matter tile style as fallback. */
export const CARTO_DARK_STYLE: any = cartoStyle("dark");

/**
 * Returns the configured Mapbox access token, or "" if none is set —
 * callers fall back to the Carto tile style in that case.
 */
export function getEffectiveMapboxToken(): string {
  return config.mapboxToken?.trim() || "";
}

/**
 * Returns the map style for `theme` — the viewer's saved map theme when
 * omitted, so every map opens in whatever they last picked.
 * Uses the official Mapbox dark-v11 / light-v11 vector styles when a token is
 * configured, otherwise the matching Carto raster style.
 */
export function getMapStyle(
  theme: MapTheme = useMapThemeStore.getState().theme,
): string | object {
  const token = getEffectiveMapboxToken();
  if (token) {
    return theme === "dark"
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/light-v11";
  }
  return cartoStyle(theme);
}

/**
 * Attaches an error handler to smoothly swap to Carto if Mapbox returns
 * 401/403. The map is flagged so later theme switches stay on Carto instead
 * of re-requesting the style that just failed.
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
        "Mapbox style authorization failed — switching to high-definition Carto tile provider",
      );
      map.__cartoOnly = true;
      try {
        map.setStyle(cartoStyle(useMapThemeStore.getState().theme));
      } catch (err) {
        console.warn("Could not set fallback style:", err);
      }
    }
  });
}

/**
 * Swaps the basemap. A full (non-diffed) reload, so the map always fires
 * `style.load` afterwards — that's the event each map listens for to re-add
 * its own sources and layers, which a style swap wipes.
 */
export function applyMapTheme(map: any, theme: MapTheme): void {
  const style = map.__cartoOnly ? cartoStyle(theme) : getMapStyle(theme);
  try {
    map.setStyle(style, { diff: false });
  } catch (err) {
    console.warn("Could not switch map theme:", err);
  }
}

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
// lucide-react's Sun and Moon, inlined — this control lives outside React.
const SUN_ICON = `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const MOON_ICON = `<svg ${SVG_ATTRS}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

/**
 * Mapbox control that toggles the map between dark and light. It sits in the
 * map's own control stack (under zoom), so no map has to find room for it in
 * its overlay layout, and it follows the shared map-theme preference — a
 * toggle on one map switches every map on screen.
 */
export class MapThemeControl {
  private container: HTMLDivElement | null = null;
  private unsubscribe: (() => void) | null = null;

  onAdd(map: any): HTMLElement {
    const container = document.createElement("div");
    container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    const button = document.createElement("button");
    button.type = "button";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.color = "#333";
    button.addEventListener("click", () =>
      useMapThemeStore.getState().toggleTheme(),
    );
    container.appendChild(button);

    // Shows what a click switches *to*, like most theme toggles.
    const render = (theme: MapTheme) => {
      const label =
        theme === "dark" ? "Switch to light map" : "Switch to dark map";
      button.innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
      button.title = label;
      button.setAttribute("aria-label", label);
    };

    let current = useMapThemeStore.getState().theme;
    render(current);
    this.unsubscribe = useMapThemeStore.subscribe((state) => {
      if (state.theme === current) return;
      current = state.theme;
      render(current);
      applyMapTheme(map, current);
    });

    this.container = container;
    return container;
  }

  onRemove(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.container?.remove();
    this.container = null;
  }
}

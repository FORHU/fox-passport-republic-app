"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { MapBoxView } from "@/shared/components/ui/MapBoxView";
import "mapbox-gl/dist/mapbox-gl.css";

const POLYGON_SOURCE_ID = "venues-map-polygons";
const DEFAULT_CENTER: [number, number] = [120.9842, 14.5995]; // Manila
const ACCENT_COLOR = "#ccff00";
const SELECTED_COLOR = "#ffffff";

// One color per venue type, shared by every map in the app — admin, the
// public browse map, and the foxer's reference layer while drawing a new
// venue — so "what kind of place is this" reads the same regardless of
// which surface you're looking at it from.
export const CATEGORY_COLORS: Record<string, string> = {
  indoor: "#ccff00",
  outdoor: "#4ade80",
  hotel: "#60a5fa",
  beach_resort: "#22d3ee",
  garden: "#a3e635",
  mix: "#c084fc",
  other: "#94a3b8",
};
const DEFAULT_CATEGORY_COLOR = "#94a3b8";

export const CATEGORY_LABELS: Record<string, string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  hotel: "Hotel",
  beach_resort: "Beach Resort",
  garden: "Garden",
  mix: "Mixed",
  other: "Other",
};

export function getCategoryColor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}

export interface MapVenue {
  id: string;
  name: string;
  lat: number | null | undefined;
  lng: number | null | undefined;
  boundary?: [number, number][] | null;
  /** Drives the pin/shape color — see CATEGORY_COLORS. */
  category?: string | null;
  /** Shown as a circular photo inside the pin, when the foxer has uploaded
   * one. Falls back to a plain colored dot otherwise. */
  imageUrl?: string | null;
  /** Optional small badge under the name in the click popup, e.g. status. */
  subtitle?: string;
}

export interface VenuesMapProps {
  venues: MapVenue[];
  /** Fit the camera to every venue's extent. Off by default for a general
   * "browse everything" view — fitting tight to whatever's in the list
   * fights the user for the zoom level they actually want; only turn it on
   * for a small, deliberately-bounded set (e.g. one venue's own shape). */
  fitToContent?: boolean;
  center?: [number, number];
  zoom?: number;
  /** Controlled selection — e.g. from a paired list. Flies/fits the camera
   * to this venue and highlights its pin/shape. */
  selectedVenueId?: string | null;
  onVenueClick?: (id: string) => void;
  /** Callback when a building cluster with multiple venues/events is clicked */
  onBuildingClick?: (venues: MapVenue[]) => void;
  onViewportChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  className?: string;
}

let pinIdCounter = 0;

/**
 * Custom pin element for building complexes or locations hosting multiple
 * spaces/events at the same coordinate. Displays building icon and count badge.
 */
export function createBuildingClusterPinElement(
  count: number,
  selected = false,
): HTMLDivElement {
  const glow = selected
    ? `drop-shadow(0 0 12px rgba(204,255,0,0.85))`
    : `drop-shadow(0 0 6px rgba(0,0,0,0.75))`;
  const el = document.createElement("div");
  el.style.cssText = `cursor: pointer; filter: ${glow}; transition: transform 0.2s;`;

  el.innerHTML = `
    <div style="display:inline-flex;align-items:center;background:#09090e;border:2px solid ${selected ? "#ccff00" : "#f59e0b"};border-radius:999px;padding:3px 8px 3px 6px;box-shadow:0 6px 18px rgba(0,0,0,0.85);gap:5px;transform:translateY(-10px);">
      <div style="width:20px;height:20px;border-radius:50%;background:${selected ? "#ccff00" : "rgba(245,158,11,0.25)"};color:${selected ? "#000" : "#f59e0b"};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;">
        🏢
      </div>
      <span style="font-size:11px;font-weight:800;color:#fff;letter-spacing:0.02em;white-space:nowrap;">
        ${count} <span style="font-size:9px;color:${selected ? "#ccff00" : "#f59e0b"};text-transform:uppercase;font-weight:900;">spaces/events</span>
      </span>
    </div>
  `;
  return el;
}

// One consistent pin design, shared everywhere a venue needs a point marker
// instead of a drawn shape. Solid-fill in the venue's category color (not
// the dark-with-outline look of a generic map pin), with the same soft neon
// glow used on button hovers elsewhere
// (`shadow-[0_0_20px_rgba(204,255,0,0.5)]`), and — when the foxer uploaded
// one — the venue's own photo cropped into the circle instead of a plain
// dot, so a pin actually shows what's there rather than just where.
// Selected pins are drawn bigger with a white ring rather than recoloring
// entirely, so the category color (the whole point of this design) doesn't
// disappear at exactly the moment you're inspecting one venue.
export function createPinElement(
  color: string = ACCENT_COLOR,
  imageUrl?: string | null,
  selected = false,
): HTMLDivElement {
  const w = selected ? 38 : 28;
  const h = selected ? 48 : 36;
  const glow = `drop-shadow(0 0 6px ${hexToRgba(selected ? SELECTED_COLOR : color, 0.55)})`;
  const ringColor = selected ? SELECTED_COLOR : "#0b0d14";
  const ringWidth = selected ? 2.5 : 1.5;
  const clipId = `pin-clip-${++pinIdCounter}`;
  const el = document.createElement("div");
  el.style.cssText = `width: ${w}px; height: ${h}px; cursor: pointer; filter: ${glow};`;

  let safeUrl: string | null = null;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    safeUrl = imageUrl.trim();
  } else if (imageUrl && typeof imageUrl === "object") {
    const candidate = (imageUrl as any).url || (imageUrl as any).imageUrl;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      safeUrl = candidate.trim();
    }
  }

  const photo = safeUrl
    ? `<clipPath id="${clipId}"><circle cx="14" cy="13.5" r="8"/></clipPath>
       <image href="${escapeHtml(safeUrl)}" x="6" y="5.5" width="16" height="16"
         preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>
       <circle cx="14" cy="13.5" r="8" fill="none" stroke="#0b0d14" stroke-width="1"/>`
    : `<circle cx="14" cy="13.5" r="5" fill="#0b0d14"/>`;

  el.innerHTML = `
    <svg width="${w}" height="${h}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs></defs>
      <path d="M14 35C14 35 26.5 20.8 26.5 13.5C26.5 6.6 20.9 1 14 1C7.1 1 1.5 6.6 1.5 13.5C1.5 20.8 14 35 14 35Z"
        fill="${color}" stroke="${ringColor}" stroke-width="${ringWidth}"/>
      ${photo}
    </svg>
  `;
  return el;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(204,255,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Mapbox "match" expression: picks a fill/line color off each feature's
// `category` property, built once from the same CATEGORY_COLORS map the
// pins use, so a venue's shape and its pin are always the same color.
export function categoryColorExpression(): any[] {
  const expr: any[] = ["match", ["get", "category"]];
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    expr.push(key, color);
  }
  expr.push(DEFAULT_CATEGORY_COLOR);
  return expr;
}

function polygonFeature(ring: [number, number][], properties: object) {
  return {
    type: "Feature" as const,
    properties,
    geometry: {
      type: "Polygon" as const,
      coordinates: [[...ring, ring[0]]],
    },
  };
}

import Supercluster from "supercluster";

export function VenuesMap({
  venues,
  fitToContent = false,
  center,
  zoom = 6,
  selectedVenueId,
  onVenueClick,
  onBuildingClick,
  onViewportChange,
  className = "h-96 w-full rounded-2xl overflow-hidden",
}: VenuesMapProps) {
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const spiderMarkersRef = useRef<any[]>([]);

  // Supercluster for zoom-based clustering of huge areas
  const clusterIndexRef = useRef(
    new Supercluster({
      radius: 60,
      maxZoom: 13,
    }),
  );

  // Read inside callbacks via refs so venues/selection updates don't tear down
  // the entire map canvas.
  const venuesRef = useRef(venues);
  const selectedIdRef = useRef(selectedVenueId);
  const onVenueClickRef = useRef(onVenueClick);
  const onBuildingClickRef = useRef(onBuildingClick);
  const onViewportChangeRef = useRef(onViewportChange);
  const everSelectedRef = useRef(false);
  // Set whenever `venues` changes so `render()` knows to rebuild the
  // Supercluster index; a selection-only re-render (same venue set) can then
  // skip re-indexing every pin from scratch.
  const venuesDirtyRef = useRef(true);

  useEffect(() => {
    venuesRef.current = venues;
    onVenueClickRef.current = onVenueClick;
    onBuildingClickRef.current = onBuildingClick;
    onViewportChangeRef.current = onViewportChange;
    venuesDirtyRef.current = true;
  }, [venues, onVenueClick, onBuildingClick, onViewportChange]);

  const handleMapReady = useCallback(
    (map: any, mapboxgl: any) => {
      mapRef.current = map;
      mapboxglRef.current = mapboxgl;

      const openPopup = (venue: MapVenue, lngLat: [number, number]) => {
        new mapboxgl.Popup({ closeButton: true, offset: 12 })
          .setLngLat(lngLat)
          .setHTML(
            `<div style="font-family:inherit;padding:2px 4px;">
              <div style="color:#0b0d14;font-weight:700;font-size:13px;">${escapeHtml(venue.name)}</div>
              ${venue.subtitle ? `<div style="color:#555;font-size:11px;margin-top:2px;">${escapeHtml(venue.subtitle)}</div>` : ""}
            </div>`,
          )
          .addTo(map);
      };

      const openBuildingPopup = (cluster: { lat: number; lng: number; venues: MapVenue[] }) => {
        const popupContent = document.createElement("div");
        popupContent.style.cssText =
          "font-family:inherit;min-width:230px;max-width:280px;padding:4px;";

        const itemsHtml = cluster.venues
          .map(
            (v) => `
          <div class="building-popup-item" data-id="${escapeHtml(v.id)}" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:10px;cursor:pointer;margin-bottom:4px;transition:background 0.15s;">
            <div style="min-width:0;flex:1;">
              <div style="font-weight:800;font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.name)}</div>
              ${v.subtitle ? `<div style="font-size:10px;color:#a1a1aa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.subtitle)}</div>` : ""}
            </div>
            <span style="font-size:10px;font-weight:800;color:#ccff00;background:rgba(204,255,0,0.12);padding:2px 7px;border-radius:6px;border:1px solid rgba(204,255,0,0.3);white-space:nowrap;">View</span>
          </div>`,
          )
          .join("");

        popupContent.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="font-size:14px;">🏢</span>
              <span style="font-size:11px;font-weight:900;text-transform:uppercase;color:#ccff00;">Building Complex</span>
            </div>
            <span style="font-size:10px;font-weight:800;background:#27272a;color:#f59e0b;padding:1px 6px;border-radius:99px;">${cluster.venues.length} spaces/events</span>
          </div>
          <div style="max-height:180px;overflow-y:auto;padding-right:2px;">
            ${itemsHtml}
          </div>
        `;

        popupContent.querySelectorAll(".building-popup-item").forEach((el) => {
          el.addEventListener("click", () => {
            const id = el.getAttribute("data-id");
            if (id) {
              onVenueClickRef.current?.(id);
            }
          });
        });

        new mapboxgl.Popup({ closeButton: true, offset: 14 })
          .setLngLat([cluster.lng, cluster.lat])
          .setDOMContent(popupContent)
          .addTo(map);
      };

      // Defined once (not inside `render`) and bound to the map exactly
      // once below — `render` re-runs on every venues/selection change, and
      // a listener created fresh each time can never be `off()`'d by a
      // later render (different function reference), so redefining it
      // inside `render` would leak one more permanent click listener per
      // re-render for the life of the map.
      const clearSpiderMarkers = () => {
        spiderMarkersRef.current.forEach((m) => m.remove());
        spiderMarkersRef.current = [];
      };
      map.on("click", clearSpiderMarkers);

      // `preserveSpiderMarkers` is set by the selection-only re-render below
      // — clicking a building cluster fans it out AND selects its first
      // venue, and that selection change itself triggers a re-render here.
      // Without this flag, that self-triggered re-render would wipe the fan
      // out from under the click that just opened it, a frame or two after
      // it appeared.
      const render = (opts: { preserveSpiderMarkers?: boolean } = {}) => {
        if (!map.isStyleLoaded()) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        if (!opts.preserveSpiderMarkers) {
          spiderMarkersRef.current.forEach((m) => m.remove());
          spiderMarkersRef.current = [];
        }

        const selectedId = selectedIdRef.current;
        const withBoundary = venuesRef.current.filter(
          (v) => Array.isArray(v.boundary) && v.boundary.length >= 3,
        );
        const withPin = venuesRef.current.filter(
          (v) => v.lat != null && v.lng != null,
        );

        const polygonData = {
          type: "FeatureCollection" as const,
          features: withBoundary.map((v) =>
            polygonFeature(v.boundary as [number, number][], {
              id: v.id,
              name: v.name,
              category: v.category ?? "other",
              selected: v.id === selectedId,
            }),
          ),
        };

        const polySource: any = map.getSource(POLYGON_SOURCE_ID);
        if (polySource) {
          polySource.setData(polygonData);
        } else {
          map.addSource(POLYGON_SOURCE_ID, {
            type: "geojson",
            data: polygonData,
          });
          map.addLayer({
            id: `${POLYGON_SOURCE_ID}-fill`,
            type: "fill",
            source: POLYGON_SOURCE_ID,
            paint: {
              "fill-color": [
                "case",
                ["get", "selected"],
                SELECTED_COLOR,
                categoryColorExpression() as any,
              ],
              "fill-opacity": ["case", ["get", "selected"], 0.25, 0.12],
            },
          });
          map.addLayer({
            id: `${POLYGON_SOURCE_ID}-halo`,
            type: "line",
            source: POLYGON_SOURCE_ID,
            paint: {
              "line-color": "#0b0d14",
              "line-width": 5,
              "line-opacity": 0.6,
            },
            layout: { "line-join": "round", "line-cap": "round" },
          });
          map.addLayer({
            id: `${POLYGON_SOURCE_ID}-line`,
            type: "line",
            source: POLYGON_SOURCE_ID,
            paint: {
              "line-color": [
                "case",
                ["get", "selected"],
                SELECTED_COLOR,
                categoryColorExpression() as any,
              ],
              "line-width": ["case", ["get", "selected"], 3, 2],
            },
            layout: { "line-join": "round", "line-cap": "round" },
          });
          map.on("click", `${POLYGON_SOURCE_ID}-fill`, (e: any) => {
            const feature = e.features?.[0];
            const venue = withBoundary.find(
              (v) => v.id === feature?.properties?.id,
            );
            if (!venue) return;
            openPopup(venue, [e.lngLat.lng, e.lngLat.lat]);
            onVenueClickRef.current?.(venue.id);
          });
          map.on(
            "mouseenter",
            `${POLYGON_SOURCE_ID}-fill`,
            () => (map.getCanvas().style.cursor = "pointer"),
          );
          map.on(
            "mouseleave",
            `${POLYGON_SOURCE_ID}-fill`,
            () => (map.getCanvas().style.cursor = ""),
          );
        }

        // Group pins that share the same building/coordinate (threshold ~15 meters)
        interface LocationCluster {
          lat: number;
          lng: number;
          venues: MapVenue[];
        }

        if (venuesDirtyRef.current) {
          const geojsonPoints = withPin.map((v) => ({
            type: "Feature" as const,
            properties: { venue: v },
            geometry: { type: "Point" as const, coordinates: [v.lng as number, v.lat as number] },
          }));
          clusterIndexRef.current.load(geojsonPoints);
          venuesDirtyRef.current = false;
        }

        const bounds = map.getBounds();
        const bbox: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ];
        const currentZoom = Math.floor(map.getZoom());
        const clusteredFeatures = clusterIndexRef.current.getClusters(bbox, currentZoom);

        const clusters: LocationCluster[] = [];
        const superclusters: any[] = [];

        clusteredFeatures.forEach((feature: any) => {
          if (feature.properties.cluster) {
            superclusters.push(feature);
          } else {
            const venue = feature.properties.venue;
            const vLat = venue.lat as number;
            const vLng = venue.lng as number;
            const match = clusters.find(
              (c) =>
                Math.abs(c.lat - vLat) < 0.00015 &&
                Math.abs(c.lng - vLng) < 0.00015,
            );
            if (match) {
              match.venues.push(venue);
            } else {
              clusters.push({ lat: vLat, lng: vLng, venues: [venue] });
            }
          }
        });

        // 1. Render massive superclusters
        superclusters.forEach((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const count = cluster.properties.point_count;
          const clusterPin = createBuildingClusterPinElement(count, false); // Reuse style
          const clusterMarker = new mapboxgl.Marker({
            element: clusterPin,
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .addTo(map);

          clusterMarker.getElement().addEventListener("click", (e: any) => {
            e.stopPropagation();
            const expansionZoom = clusterIndexRef.current.getClusterExpansionZoom(cluster.properties.cluster_id);
            map.flyTo({ center: [lng, lat], zoom: expansionZoom });
          });
          markersRef.current.push(clusterMarker);
        });

        clusters.forEach((cluster) => {
          if (cluster.venues.length === 1) {
            const venue = cluster.venues[0];
            const isSelected = venue.id === selectedId;
            const marker = new mapboxgl.Marker({
              element: createPinElement(
                getCategoryColor(venue.category),
                venue.imageUrl,
                isSelected,
              ),
              anchor: "bottom",
            })
              .setLngLat([cluster.lng, cluster.lat])
              .addTo(map);
            marker.getElement().addEventListener("click", (e: any) => {
              e.stopPropagation();
              clearSpiderMarkers();
              openPopup(venue, [cluster.lng, cluster.lat]);
              onVenueClickRef.current?.(venue.id);
            });
            markersRef.current.push(marker);
          } else {
            // Multi-item / building complex cluster!
            const isSelected = cluster.venues.some((v) => v.id === selectedId);
            const clusterPin = createBuildingClusterPinElement(
              cluster.venues.length,
              isSelected,
            );

            const clusterMarker = new mapboxgl.Marker({
              element: clusterPin,
              anchor: "bottom",
            })
              .setLngLat([cluster.lng, cluster.lat])
              .addTo(map);

            clusterMarker.getElement().addEventListener("click", (e: any) => {
              e.stopPropagation();
              clearSpiderMarkers();

              // 1. Spiderfy satellite markers around building location
              const count = cluster.venues.length;
              const radius = 0.00042; // ~45m visual separation
              cluster.venues.forEach((v, idx) => {
                const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
                const sLng =
                  cluster.lng +
                  (radius * Math.cos(angle)) /
                    Math.cos((cluster.lat * Math.PI) / 180);
                const sLat = cluster.lat + radius * Math.sin(angle);
                const isItemSel = v.id === selectedId;

                const spiderMarker = new mapboxgl.Marker({
                  element: createPinElement(
                    getCategoryColor(v.category),
                    v.imageUrl,
                    isItemSel,
                  ),
                  anchor: "bottom",
                })
                  .setLngLat([sLng, sLat])
                  .addTo(map);

                spiderMarker.getElement().addEventListener("click", (ev: any) => {
                  ev.stopPropagation();
                  openPopup(v, [sLng, sLat]);
                  onVenueClickRef.current?.(v.id);
                });

                spiderMarkersRef.current.push(spiderMarker);
              });

              // 2. Open building popup with full list
              openBuildingPopup(cluster);

              // 3. Notify listeners
              onBuildingClickRef.current?.(cluster.venues);
              onVenueClickRef.current?.(cluster.venues[0].id);

              if (map.getZoom() < 15) {
                map.flyTo({
                  center: [cluster.lng, cluster.lat],
                  zoom: 15,
                  essential: true,
                });
              }
            });

            markersRef.current.push(clusterMarker);
          }
        });

        if (fitToContent) {
          const points: [number, number][] = [
            ...withBoundary.flatMap((v) => v.boundary as [number, number][]),
            ...withPin.map(
              (v) => [v.lng as number, v.lat as number] as [number, number],
            ),
          ];
          if (points.length > 0) {
            let minLng = points[0][0];
            let maxLng = points[0][0];
            let minLat = points[0][1];
            let maxLat = points[0][1];
            for (const [pLng, pLat] of points) {
              minLng = Math.min(minLng, pLng);
              maxLng = Math.max(maxLng, pLng);
              minLat = Math.min(minLat, pLat);
              maxLat = Math.max(maxLat, pLat);
            }
            map.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              { padding: 50, duration: 0, maxZoom: 16 },
            );
          }
        }
      };

      const flyToVenue = (id: string) => {
        const venue = venuesRef.current.find((v) => v.id === id);
        if (!venue) return;

        if (Array.isArray(venue.boundary) && venue.boundary.length >= 3) {
          const ring = venue.boundary;
          let minLng = ring[0][0];
          let maxLng = ring[0][0];
          let minLat = ring[0][1];
          let maxLat = ring[0][1];
          for (const [pLng, pLat] of ring) {
            minLng = Math.min(minLng, pLng);
            maxLng = Math.max(maxLng, pLng);
            minLat = Math.min(minLat, pLat);
            maxLat = Math.max(maxLat, pLat);
          }
          map.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 80, duration: 800, maxZoom: 16 },
          );
        } else if (venue.lat != null && venue.lng != null) {
          map.flyTo({
            center: [venue.lng, venue.lat],
            zoom: 15,
            duration: 800,
          });
        }
      };

      const initialCenter = center ?? DEFAULT_CENTER;
      const initialZoom = zoom;
      const flyToInitial = () => {
        map.flyTo({ center: initialCenter, zoom: initialZoom, duration: 800 });
      };

      const emitBounds = () => {
        try {
          const b = map.getBounds();
          if (b && onViewportChangeRef.current) {
            onViewportChangeRef.current({
              north: b.getNorth(),
              south: b.getSouth(),
              east: b.getEast(),
              west: b.getWest(),
            });
          }
        } catch {
          // ignore if map canvas not ready
        }
      };

      map.on("moveend", emitBounds);
      map.on("load", () => {
        render();
        emitBounds();
      });
      map.on("style.load", render);
      (map as any).__rerender = render;
      (map as any).__flyToVenue = flyToVenue;
      (map as any).__flyToInitial = flyToInitial;

      render();
      if (map.isStyleLoaded()) {
        emitBounds();
      }
    },
    [center, fitToContent, zoom],
  );

  useEffect(() => {
    mapRef.current?.__rerender?.();
  }, [venues]);

  useEffect(() => {
    selectedIdRef.current = selectedVenueId;
    mapRef.current?.__rerender?.({ preserveSpiderMarkers: true });
    if (selectedVenueId) {
      everSelectedRef.current = true;
      mapRef.current?.__flyToVenue?.(selectedVenueId);
    } else if (everSelectedRef.current) {
      mapRef.current?.__flyToInitial?.();
    }
  }, [selectedVenueId]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      spiderMarkersRef.current.forEach((m) => m.remove());
      spiderMarkersRef.current = [];
    };
  }, []);

  return (
    <MapBoxView
      center={center ?? DEFAULT_CENTER}
      zoom={zoom}
      className={className}
      onMapReady={handleMapReady}
    />
  );
}

function escapeHtml(s: unknown): string {
  if (s == null) return "";
  const str =
    typeof s === "string"
      ? s
      : typeof (s as any)?.url === "string"
        ? (s as any).url
        : typeof (s as any)?.name === "string"
          ? (s as any).name
          : String(s);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

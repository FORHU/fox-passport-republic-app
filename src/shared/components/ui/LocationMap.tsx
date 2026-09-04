"use client";

import React, { useRef, useEffect } from "react";
import { config } from "@/shared/lib/config";
import { createPinElement } from "@/shared/components/ui/VenuesMap";
import "mapbox-gl/dist/mapbox-gl.css";

const BOUNDARY_SOURCE_ID = "location-map-boundary";
const ACCENT_COLOR = "#ccff00";

interface LocationMapProps {
  lat: number;
  lng: number;
  /** The venue's drawn service area, if it has one. Rendered as a filled,
   * read-only shape instead of just a center marker. */
  boundary?: [number, number][] | null;
  className?: string;
}

export function LocationMap({
  lat,
  lng,
  boundary,
  className = "h-80 w-full rounded-2xl overflow-hidden",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !config.mapboxToken) return;
    let alive = true;
    const hasBoundary = Array.isArray(boundary) && boundary.length >= 3;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (!alive || !containerRef.current) return;

      mapboxgl.accessToken = config.mapboxToken;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [lng, lat],
        zoom: hasBoundary ? 13 : 12,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      new mapboxgl.Marker({ element: createPinElement(), anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);

      if (!hasBoundary) return;

      map.on("load", () => {
        if (!alive) return;
        const ring = [...(boundary as [number, number][])];
        const closedRing =
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring
            : [...ring, ring[0]];

        const data = {
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Polygon" as const, coordinates: [closedRing] },
        };

        map.addSource(BOUNDARY_SOURCE_ID, { type: "geojson", data });
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-fill`,
          type: "fill",
          source: BOUNDARY_SOURCE_ID,
          paint: { "fill-color": ACCENT_COLOR, "fill-opacity": 0.12 },
        });
        // Dark halo under the bright outline so it stays legible over
        // street labels — same technique as the venue-builder map picker.
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-halo`,
          type: "line",
          source: BOUNDARY_SOURCE_ID,
          paint: { "line-color": "#0b0d14", "line-width": 5, "line-opacity": 0.6 },
          layout: { "line-join": "round", "line-cap": "round" },
        });
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-line`,
          type: "line",
          source: BOUNDARY_SOURCE_ID,
          paint: { "line-color": ACCENT_COLOR, "line-width": 2 },
          layout: { "line-join": "round", "line-cap": "round" },
        });

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
          { padding: 50, duration: 0, maxZoom: 16 },
        );
      });
    });

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return <div ref={containerRef} className={className} />;
}

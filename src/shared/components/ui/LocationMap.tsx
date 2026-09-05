"use client";

import React, { useMemo, useCallback } from "react";
import { MapBoxView, MapMarkerItem } from "@/shared/components/ui/MapBoxView";
import { createPinElement } from "@/shared/components/ui/VenuesMap";

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
  const hasBoundary = Array.isArray(boundary) && boundary.length >= 3;

  const markers: MapMarkerItem[] = useMemo(
    () => [
      {
        id: "location-pin",
        lng,
        lat,
        element: typeof window !== "undefined" ? createPinElement() : undefined,
      },
    ],
    [lng, lat],
  );

  const handleMapReady = useCallback(
    (map: any) => {
      if (!hasBoundary || !boundary) return;
      const ring = [...boundary];
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

      if (map.getSource(BOUNDARY_SOURCE_ID)) {
        (map.getSource(BOUNDARY_SOURCE_ID) as any).setData(data);
      } else {
        map.addSource(BOUNDARY_SOURCE_ID, { type: "geojson", data });
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-fill`,
          type: "fill",
          source: BOUNDARY_SOURCE_ID,
          paint: { "fill-color": ACCENT_COLOR, "fill-opacity": 0.12 },
        });
        // Dark halo under the bright outline so it stays legible over street labels
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-halo`,
          type: "line",
          source: BOUNDARY_SOURCE_ID,
          paint: {
            "line-color": "#0b0d14",
            "line-width": 5,
            "line-opacity": 0.6,
          },
          layout: { "line-join": "round", "line-cap": "round" },
        });
        map.addLayer({
          id: `${BOUNDARY_SOURCE_ID}-line`,
          type: "line",
          source: BOUNDARY_SOURCE_ID,
          paint: { "line-color": ACCENT_COLOR, "line-width": 2 },
          layout: { "line-join": "round", "line-cap": "round" },
        });
      }

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
    },
    [boundary, hasBoundary],
  );

  return (
    <MapBoxView
      center={[lng, lat]}
      zoom={hasBoundary ? 13 : 12}
      markers={markers}
      className={className}
      onMapReady={handleMapReady}
    />
  );
}

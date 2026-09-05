"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MapBoxViewProps, MapMarkerItem } from "./MapBoxViewImpl";

export type { MapBoxViewProps, MapMarkerItem };

/**
 * Lazy SSR boundary in front of Mapbox GL.
 * Adopts the mapanytime architecture:
 * - Dynamic code splitting: isolates the 500kB mapbox bundle from initial page load
 * - ssr: false prevents hydration mismatches and window DOM errors
 * - Premium dark skeleton loader while the bundle loads
 */
const MapBoxViewDynamic = dynamic(
  () => import("./MapBoxViewImpl").then((m) => m.MapBoxViewImpl),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] rounded-2xl bg-[#0b0d14] border border-white/10 flex flex-col items-center justify-center gap-3 p-6 text-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-[#ccff00]/30 border-t-[#ccff00] animate-spin" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 font-mono">
          Loading Map Engine...
        </span>
      </div>
    ),
  },
);

export function MapBoxView(props: MapBoxViewProps) {
  return <MapBoxViewDynamic {...props} />;
}

export default MapBoxView;

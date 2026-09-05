"use client";

import React, { useState } from "react";
import Link from "next/link";
interface PartnerEquipmentDepotCardProps {
  onMapToggled?: (isOpen: boolean) => void;
  mapSlot?: React.ReactNode;
}

export function PartnerEquipmentDepotCard({
  onMapToggled,
  mapSlot,
}: PartnerEquipmentDepotCardProps) {
  const [showInlineMap, setShowInlineMap] = useState(false);

  const toggleMap = () => {
    const next = !showInlineMap;
    setShowInlineMap(next);
    if (onMapToggled) onMapToggled(next);
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-amber-950/30 via-zinc-900/90 to-zinc-950 border border-amber-500/30 p-5 shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
            <span className="material-symbols-outlined text-[16px]">
              inventory_2
            </span>
            Partner Resource Pool
          </div>
          <h3 className="text-base font-black text-white tracking-tight">
            Equipment Depots & Capital
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-lime-400/15 text-lime-400 border border-lime-400/30 shrink-0">
          Live Hubs
        </span>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
        Access pooled event tools (banquet chairs, concert audio, stage trusses,
        silent generators) stored at partner depots.
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {mapSlot ? (
          <button
            type="button"
            onClick={toggleMap}
            className={`px-3 py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              showInlineMap
                ? "bg-amber-400 text-black border-amber-300 shadow-md"
                : "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {showInlineMap ? "layers_clear" : "map"}
            </span>
            {showInlineMap ? "Hide Map" : "View Map"}
          </button>
        ) : (
          <Link
            href="/republic/investments"
            className="px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all truncate"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            Explore Map
          </Link>
        )}

        <Link
          href="/foxer/create-investment"
          className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all truncate"
        >
          <span className="material-symbols-outlined text-[16px]">
            add_circle
          </span>
          Add Tools
        </Link>
      </div>

      {/* Collapsible Inline Map */}
      {showInlineMap && mapSlot && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2 space-y-2">
          {mapSlot}
          <div className="flex justify-end">
            <Link
              href="/republic/investments"
              className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              Open Full Partner Hub{" "}
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

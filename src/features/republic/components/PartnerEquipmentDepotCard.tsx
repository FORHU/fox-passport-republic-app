"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
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
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 text-[10px] font-black uppercase tracking-wider text-amber-400">
            <span className="material-symbols-outlined text-[16px] shrink-0">
              inventory_2
            </span>
            <span className="truncate min-w-0">Partner Resource Pool</span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight">
            Equipment Depots & Capital
          </h3>
        </div>
        <Badge
          variant="verified"
          icon={false}
          dot
          className="text-[9px] shrink-0"
        >
          Live Hubs
        </Badge>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">
        Access pooled event tools (banquet chairs, concert audio, stage trusses,
        silent generators) stored at partner depots.
      </p>

      {/* Action Buttons — minmax(0,1fr) tracks so a button can actually
          shrink/truncate its label instead of forcing the grid (and this
          card's overflow-hidden) to clip content at the narrower md
          breakpoint width (see RepublicLeftSidebar's w-64). */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        {mapSlot ? (
          <button
            type="button"
            onClick={toggleMap}
            className={`min-w-0 px-3 py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              showInlineMap
                ? "bg-amber-400 text-black border-amber-300 shadow-md"
                : "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">
              {showInlineMap ? "layers_clear" : "map"}
            </span>
            <span className="truncate min-w-0">
              {showInlineMap ? "Hide Map" : "View Map"}
            </span>
          </button>
        ) : (
          <Link
            href="/republic/investments"
            className="min-w-0 px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">
              map
            </span>
            <span className="truncate min-w-0">Explore Map</span>
          </Link>
        )}

        <Link
          href="/foxer/create-investment"
          className="min-w-0 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[16px] shrink-0">
            add_circle
          </span>
          <span className="truncate min-w-0">Add Tools</span>
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

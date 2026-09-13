"use client";

import Link from "next/link";
import { ArrowRight, Compass, PenTool, PlusCircle } from "lucide-react";

/**
 * Quick-access directory links pinned to the Republic left sidebar.
 * Lists the three most common creator actions: viewing the full equipment
 * inventory map, registering a new equipment hub, and drawing/adding a venue.
 */
export function RepublicShortcutsCard() {
  return (
    <div className="rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-2 text-xs">
      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
        Republic Shortcuts
      </div>
      <Link
        href="/republic/investments"
        className="flex items-center justify-between text-zinc-400 hover:text-amber-300 py-1.5 transition-colors group"
      >
        <span className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-amber-400" strokeWidth={2} />
          Full Inventory Map
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-zinc-600 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2}
        />
      </Link>
      <Link
        href="/foxer/create-investment"
        className="flex items-center justify-between text-zinc-400 hover:text-lime-400 py-1.5 transition-colors group"
      >
        <span className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-lime-400" strokeWidth={2} />
          Register Equipment Hub
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-zinc-600 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2}
        />
      </Link>
      <Link
        href="/venue-foxer/create-venue"
        className="flex items-center justify-between text-zinc-400 hover:text-pink-400 py-1.5 transition-colors group"
      >
        <span className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-pink-400" strokeWidth={2} />
          Draw &amp; Add Venue
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-zinc-600 group-hover:translate-x-0.5 transition-transform"
          strokeWidth={2}
        />
      </Link>
    </div>
  );
}

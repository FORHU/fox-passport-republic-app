"use client";

import Link from "next/link";
import { NotebookPen, Package } from "lucide-react";
import { FeedTab } from "@/features/republic/types";
import { RepublicTabs } from "@/features/republic/components/RepublicTabs";

interface RepublicMobileControlBarProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  onComposeOpen: () => void;
}

/**
 * Sticky mobile-only control bar that docks under the floating header.
 *
 * Contains three pieces:
 * 1. Swipeable tab pills (`RepublicTabs`) for switching between feed streams.
 * 2. A quick "Post" compose button that opens the shared compose modal.
 * 3. A mobile-only Equipment Depots shortcut banner linking to the full map
 *    (hidden on md+ where the left sidebar's PartnerEquipmentDepotCard takes
 *    over this role).
 *
 * Kept outside `RepublicFeedContent` so it can be wrapped in a
 * `memo()` boundary if the compose-open and tab-change callbacks are
 * stabilised with `useCallback` (which they are in the parent).
 */
export function RepublicMobileControlBar({
  activeTab,
  onTabChange,
  onComposeOpen,
}: RepublicMobileControlBarProps) {
  return (
    <>
      {/* Sticky tabs + compose button — mobile only */}
      <div className="md:hidden sticky top-16 z-40 py-2.5 bg-[#09090e]/95 backdrop-blur-2xl border-b border-zinc-800/80 -mx-3 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2 transform-gpu">
        {/* Stream Tabs (horizontal swipeable pills) */}
        <div className="flex-1 min-w-0">
          <RepublicTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            orientation="horizontal"
          />
        </div>

        {/* Quick Create Post Action */}
        <button
          onClick={onComposeOpen}
          className="shrink-0 py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer bg-lime-400 hover:bg-lime-300 text-black"
        >
          <NotebookPen className="h-4 w-4" strokeWidth={2} />
          <span className="hidden xs:inline">Post</span>
        </button>
      </div>

      {/* Mobile-only Quick Depots Map Link — sits inside the feed column
          on mobile where the left sidebar is hidden. */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-zinc-900 border border-amber-500/20 text-xs shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <Package
            className="h-[18px] w-[18px] text-amber-400 shrink-0"
            strokeWidth={2}
          />
          <span className="font-bold text-zinc-200 text-xs truncate">
            Equipment Depots &amp; Capital
          </span>
        </div>
        <Link
          href="/republic/investments"
          className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-black transition-colors"
        >
          View Map →
        </Link>
      </div>
    </>
  );
}

"use client";

import { memo, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CitizenProfileSidebarCard } from "@/features/republic/components/CitizenProfileSidebarCard";
import { PartnerEquipmentDepotCard } from "@/features/republic/components/PartnerEquipmentDepotCard";
import { RepublicShortcutsCard } from "@/features/republic/components/RepublicShortcutsCard";

interface RepublicLeftSidebarProps {
  /** Map component injected from the app layer to keep cross-feature
   *  composition out of the feature boundary. */
  mapSlot: ReactNode;
}

/**
 * Sticky left sidebar for the Republic feed page.
 *
 * Memoized so the left column (profile card, Partner Resource Pool, shortcut
 * links) doesn't re-render — and visibly flicker/reflow, since it's sticky
 * with a blurred background — on every scroll-triggered post load, search
 * keystroke, or sort toggle in the feed next to it. Takes no props tied to
 * feed state, so it never has a reason to re-render after mount.
 *
 * `md:max-h-[calc(100vh-8.25rem)] md:overflow-y-auto` bounds the sticky
 * column to the viewport and scrolls its own overflow internally (the inline
 * equipment map can make this column taller than the screen) — without a cap,
 * `position: sticky` pins the *whole* oversized column to the top of the
 * viewport while the much taller feed column scrolls, leaving anything past
 * the first screenful of the sidebar stuck below the fold.
 */
export const RepublicLeftSidebar = memo(function RepublicLeftSidebar({
  mapSlot,
}: RepublicLeftSidebarProps) {
  return (
    <aside className="hidden md:block w-64 xl:w-80 shrink-0 md:sticky md:top-[8.25rem] md:self-start md:max-h-[calc(100vh-8.25rem)] md:overflow-y-auto space-y-4 h-fit [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Direct Back to Home link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-800/80 transition-all shadow-sm group cursor-pointer"
      >
        <ArrowLeft
          className="h-4 w-4 text-zinc-400 group-hover:text-lime-400 group-hover:-translate-x-1 transition-all"
          strokeWidth={2}
        />
        Back to Main Page
      </Link>

      {/* Profile Icon / Passport Card */}
      <CitizenProfileSidebarCard />

      {/* Partner Resource Pool — always on the left, not tucked in for medium
          screens only. mapSlot is injected from the app layer (page.tsx) so
          this feature component stays within its isolation boundary. */}
      <PartnerEquipmentDepotCard mapSlot={mapSlot} />

      {/* Quick Republic Resource Links */}
      <RepublicShortcutsCard />
    </aside>
  );
});

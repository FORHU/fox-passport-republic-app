"use client";

import { memo, ReactNode } from "react";
import { CitizenProfileSidebarCard } from "@/features/republic/components/CitizenProfileSidebarCard";
import { PartnerEquipmentDepotCard } from "@/features/republic/components/PartnerEquipmentDepotCard";
import { RepublicShortcutsCard } from "@/features/republic/components/RepublicShortcutsCard";
import { BackButton } from "@/shared/components/ui/BackButton";

interface RepublicLeftSidebarProps {
  /** Map component injected from the app layer to keep cross-feature
   *  composition out of the feature boundary. */
  mapSlot: ReactNode;
}

/**
 * Left sidebar content for the Republic feed page (profile card, Partner
 * Resource Pool, shortcut links).
 *
 * Deliberately a plain `w-full` container, not its own fixed-width/sticky/
 * scrolling `<aside>` — the page (`app/republic/page.tsx`) already wraps
 * this in an `<aside w-[280px] overflow-y-auto>` that owns sizing and
 * independent scroll for this column. An earlier version of this component
 * declared its own conflicting width (`w-64 xl:w-80`, wider than the
 * parent's 280px at the `xl` breakpoint) and its own sticky/overflow rules,
 * which fought the outer aside and spilled content past the column's right
 * edge, clipped by each card's own `overflow-hidden`.
 *
 * Memoized so this column doesn't re-render on every scroll-triggered post
 * load, search keystroke, or sort toggle in the feed next to it — it takes
 * no props tied to feed state, so it never has a reason to re-render after
 * mount.
 */
export const RepublicLeftSidebar = memo(function RepublicLeftSidebar({
  mapSlot,
}: RepublicLeftSidebarProps) {
  return (
    <div className="w-full space-y-4">
      {/* Direct Back to Home link */}
      <BackButton variant="label" href="/" label="Back to Main Page" />

      {/* Profile Icon / Passport Card */}
      <CitizenProfileSidebarCard />

      {/* Partner Resource Pool — always on the left, not tucked in for medium
          screens only. mapSlot is injected from the app layer (page.tsx) so
          this feature component stays within its isolation boundary. */}
      <PartnerEquipmentDepotCard mapSlot={mapSlot} />

      {/* Quick Republic Resource Links */}
      <RepublicShortcutsCard />
    </div>
  );
});

"use client";

import { memo, ReactNode } from "react";
import { CitizenProfileSidebarCard } from "@/features/republic/components/CitizenProfileSidebarCard";
import { PartnerEquipmentDepotCard } from "@/features/republic/components/PartnerEquipmentDepotCard";
import { RepublicShortcutsCard } from "@/features/republic/components/RepublicShortcutsCard";
import { BackButton } from "@/shared/components/ui/BackButton";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { isPartnerUser } from "@/shared/auth/roles";

interface RepublicLeftSidebarProps {
  /** Map component injected from the app layer to keep cross-feature
   *  composition out of the feature boundary. */
  mapSlot: ReactNode;
}

/**
 * Left sidebar content for the Republic feed page (profile card, Partner
 * Resource Pool for investors, shortcut links).
 *
 * Deliberately a plain `w-full` container, not its own fixed-width/sticky/
 * scrolling `<aside>` — the page (`app/republic/page.tsx`) wraps this in an
 * `<aside w-[320px] sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto>`
 * that owns sizing, stickiness and independent scroll for this column, so
 * the whole column stays reachable on short laptop screens. Don't add width,
 * sticky or overflow rules here; they would fight the outer aside.
 *
 * Memoized so this column doesn't re-render on every scroll-triggered post
 * load, search keystroke, or sort toggle in the feed next to it — it takes
 * no props tied to feed state. It only re-renders when the signed-in user
 * changes (for the investor check below).
 */
export const RepublicLeftSidebar = memo(function RepublicLeftSidebar({
  mapSlot,
}: RepublicLeftSidebarProps) {
  // The depot/capital map is an investor (Partner Foxer) tool. Everyone else
  // still reaches it from /republic/investments and the user menu, so the
  // feed sidebar only carries it for investors (FORHU/fox-passport-republic-app#304).
  const isInvestor = useAuthStore((s) =>
    s.user ? isPartnerUser(s.user) : false,
  );

  return (
    <div className="w-full space-y-4">
      {/* Direct Back to Home link */}
      <BackButton variant="label" href="/" label="Back to Main Page" />

      {/* Profile Icon / Passport Card */}
      <CitizenProfileSidebarCard />

      {/* Partner Resource Pool — investors only. mapSlot is injected from the
          app layer (page.tsx) so this feature component stays within its
          isolation boundary. */}
      {isInvestor && <PartnerEquipmentDepotCard mapSlot={mapSlot} />}

      {/* Quick Republic Resource Links */}
      <RepublicShortcutsCard />
    </div>
  );
});

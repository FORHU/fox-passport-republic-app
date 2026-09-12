"use client";

import { memo } from "react";
import { FollowingWidget } from "@/features/republic/components/FollowingWidget";

/**
 * Sticky right sidebar — visible only on xl (≥ 1280px) breakpoints.
 *
 * Memoized for the same reason as `RepublicLeftSidebar`: its content
 * (the FollowingWidget) is entirely independent of feed state, so it
 * should never re-render on scroll-triggered post loads, search keystrokes,
 * or sort changes.
 */
export const RepublicRightSidebar = memo(function RepublicRightSidebar() {
  return (
    <aside className="hidden xl:block w-80 xl:w-96 shrink-0 xl:sticky xl:top-[8.25rem] xl:self-start xl:h-[calc(100vh-8.25rem)]">
      <FollowingWidget />
    </aside>
  );
});

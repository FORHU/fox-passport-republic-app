"use client";

import { memo } from "react";

/**
 * Sticky right sidebar — visible only on xl (≥ 1280px) breakpoints.
 *
 * Memoized for the same reason as `RepublicLeftSidebar`: its content
 * (the FollowingWidget, composed by the caller — see `FollowingWidgetSection`
 * in `app/republic`) is entirely independent of feed state, so it should
 * never re-render on scroll-triggered post loads, search keystrokes, or sort
 * changes. Takes `children` rather than rendering `FollowingWidget` itself so
 * this feature never has to reach into `follow`/`block`/`messages` to wire it.
 */
export const RepublicRightSidebar = memo(function RepublicRightSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="hidden xl:block w-80 xl:w-96 shrink-0 xl:sticky xl:top-[8.25rem] xl:self-start xl:h-[calc(100vh-8.25rem)]">
      {children}
    </aside>
  );
});

"use client";

import { memo } from "react";

/**
 * Right sidebar content for the Republic feed page (currently just
 * `FollowingWidgetSection`, composed by the caller).
 *
 * Deliberately a plain `w-full` container, not its own fixed-width `<aside>`
 * — the page (`app/republic/page.tsx`) already wraps this in an
 * `<aside w-[280px] overflow-y-auto>` that owns sizing and independent
 * scroll for this column. An earlier version declared its own conflicting
 * width (`w-80 xl:w-96`, up to 384px — wider than the parent's 280px), which
 * spilled content (e.g. the Message Requests row) past the column's right
 * edge. See the identical bug/fix on `RepublicLeftSidebar`.
 *
 * Memoized for the same reason as `RepublicLeftSidebar`: its content (the
 * FollowingWidget) is entirely independent of feed state, so it should
 * never re-render on scroll-triggered post loads, search keystrokes, or sort
 * changes. Takes `children` rather than rendering `FollowingWidget` itself so
 * this feature never has to reach into `follow`/`block`/`messages` to wire it.
 */
export const RepublicRightSidebar = memo(function RepublicRightSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full">{children}</div>;
});

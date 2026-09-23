"use client";

import React from "react";
import type { ScheduleConflict } from "@/features/booking/api/bookings";

const TYPE_LABEL: Record<ScheduleConflict["type"], string> = {
  venue: "Venue",
  event: "Event",
  asset: "Equipment",
  service: "Service",
};

/**
 * A heads-up, never a blocker — see BookingSvc.getScheduleConflicts. Shown
 * once the citizen has already picked dates that overlap something else
 * they've booked, so they can double check before paying for a second
 * commitment on the same day, not because the platform disallows it.
 */
export function ScheduleConflictWarning({
  conflicts,
}: {
  conflicts: ScheduleConflict[];
}) {
  if (conflicts.length === 0) return null;

  return (
    <div className="flex items-start gap-2.5 mt-3 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
      <span className="material-symbols-outlined text-amber-400 text-[16px] mt-0.5 shrink-0">
        event_repeat
      </span>
      <p className="text-xs text-amber-300">
        You already have {conflicts.length === 1 ? "something" : `${conflicts.length} things`}{" "}
        booked over these dates —{" "}
        {conflicts
          .slice(0, 3)
          .map((c) => `${c.title} (${TYPE_LABEL[c.type]})`)
          .join(", ")}
        {conflicts.length > 3 ? ", and more" : ""}. This won&apos;t stop the
        booking, just a heads-up.
      </p>
    </div>
  );
}

export default ScheduleConflictWarning;

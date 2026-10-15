"use client";

import React, { useEffect, useState } from "react";
import type { LineItemStatus } from "@/features/event/api/marketplaceItems";

function timeRemaining(deadline: string): string {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "expiring…";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) return `${hours}h left to respond`;
  const minutes = Math.max(1, Math.floor(ms / (1000 * 60)));
  return `${minutes}m left to respond`;
}

const STYLES: Record<
  LineItemStatus,
  { label: string; icon: string; className: string }
> = {
  pending: {
    label: "Included",
    icon: "check_circle",
    className: "bg-accent/10 border-accent/30 text-accent",
  },
  pending_provider_confirmation: {
    label: "Awaiting confirmation",
    icon: "hourglass_top",
    className: "bg-yellow-400/10 border-yellow-400/30 text-yellow-400",
  },
  approved: {
    label: "Confirmed",
    icon: "verified",
    className: "bg-green-400/10 border-green-400/30 text-green-400",
  },
  rejected: {
    label: "Declined",
    icon: "cancel",
    className: "bg-red-400/10 border-red-400/30 text-red-400",
  },
  cancelled: {
    label: "Removed",
    icon: "remove_circle",
    className: "bg-white/5 border-white/10 text-white/40",
  },
};

export interface LineItemStatusBadgeProps {
  status: LineItemStatus;
  confirmationDeadline?: string | null;
}

/** Re-renders once a minute so a live deadline countdown doesn't go stale
 * without the user refreshing — cheap, since this only runs while a badge
 * showing a deadline is actually mounted. */
export function LineItemStatusBadge({
  status,
  confirmationDeadline,
}: LineItemStatusBadgeProps) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (status !== "pending_provider_confirmation" || !confirmationDeadline)
      return;
    const id = setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [status, confirmationDeadline]);

  const style = STYLES[status] ?? STYLES.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${style.className}`}
    >
      <span className="material-symbols-outlined text-[13px]">
        {style.icon}
      </span>
      {style.label}
      {status === "pending_provider_confirmation" && confirmationDeadline && (
        <span className="opacity-70 font-medium">
          · {timeRemaining(confirmationDeadline)}
        </span>
      )}
    </span>
  );
}

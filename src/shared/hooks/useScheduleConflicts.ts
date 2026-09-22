"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  fetchScheduleConflicts,
  ScheduleConflict,
} from "@/features/booking/api/bookings";

/**
 * Looks up whether the citizen already has something booked over the dates
 * they're currently configuring — informational only, never blocking (see
 * BookingSvc.getScheduleConflicts). Silently empty while logged out or
 * before both dates are picked, since there's nothing to check yet.
 */
export function useScheduleConflicts(
  startDate: string,
  endDate: string,
): ScheduleConflict[] {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !startDate || !endDate) {
      setConflicts([]);
      return;
    }
    let cancelled = false;
    fetchScheduleConflicts(
      new Date(`${startDate}T00:00:00`).toISOString(),
      new Date(`${endDate}T23:59:59`).toISOString(),
    )
      .then((result) => {
        if (!cancelled) setConflicts(result);
      })
      .catch(() => {
        if (!cancelled) setConflicts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, startDate, endDate]);

  return conflicts;
}

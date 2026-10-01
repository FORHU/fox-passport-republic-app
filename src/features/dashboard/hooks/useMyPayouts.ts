"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyPayouts } from "@/features/dashboard/api/payouts";

/**
 * The signed-in Foxer's payouts, cached under `host-data` — which the
 * `bookings` socket topic invalidates, so a payout released on a booking
 * shows up without a reload, and revisiting Earnings renders from cache.
 */
export function useMyPayouts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["host-data", "payouts", page, limit],
    queryFn: () => fetchMyPayouts(page, limit),
  });
}

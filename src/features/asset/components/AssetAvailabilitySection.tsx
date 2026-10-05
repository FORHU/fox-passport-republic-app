"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { useAssetAvailability } from "@/features/booking/hooks/useAvailability";
import AvailabilityCalendar from "@/features/booking/components/AvailabilityCalendar";

const noop = () => {};
const NO_RANGES: { startDate: string; endDate: string; bookedQty: number }[] =
  [];

/**
 * A gear Foxer's own read on their asset's calendar — the same booked-range
 * data the citizen's rental page shows, reused here read-only (no date is
 * ever "selected", so nothing to submit). There's no manual-block concept
 * for assets today, unlike a venue's `blockedDates` — this is demand only.
 */
export function AssetAvailabilitySection({ assetId }: { assetId: string }) {
  const { data, isPending: loading, isError } = useAssetAvailability(assetId);
  const bookedRanges = data?.bookedRanges ?? NO_RANGES;
  const totalQty = data?.totalQty ?? 0;

  useEffect(() => {
    if (isError) toast.error("Could not load this asset's calendar.");
  }, [isError]);

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-white/10 bg-surface/30 p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-accent">
            event_available
          </span>
          Availability
        </h3>
        <p className="text-xs text-text-muted">
          Days a citizen has already reserved this equipment — updates
          automatically as bookings come in.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-text-muted text-sm">
          Loading…
        </div>
      ) : (
        <AvailabilityCalendar
          mode="range"
          startValue=""
          endValue=""
          onStartChange={noop}
          onEndChange={noop}
          bookedRanges={bookedRanges}
          totalQty={totalQty || 1}
          requestedQty={1}
          accent="purple"
        />
      )}
    </div>
  );
}

export default AssetAvailabilitySection;

"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchAssetAvailability } from "@/features/booking/api/bookings";
import AvailabilityCalendar from "@/features/booking/components/AvailabilityCalendar";

const noop = () => {};

/**
 * A gear Foxer's own read on their asset's calendar — the same booked-range
 * data the citizen's rental page shows, reused here read-only (no date is
 * ever "selected", so nothing to submit). There's no manual-block concept
 * for assets today, unlike a venue's `blockedDates` — this is demand only.
 */
export function AssetAvailabilitySection({ assetId }: { assetId: string }) {
  const [bookedRanges, setBookedRanges] = useState<
    { startDate: string; endDate: string; bookedQty: number }[]
  >([]);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetAvailability(assetId)
      .then((d) => {
        setBookedRanges(d.bookedRanges);
        setTotalQty(d.totalQty);
      })
      .catch(() => toast.error("Could not load this asset's calendar."))
      .finally(() => setLoading(false));
  }, [assetId]);

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-white/10 bg-[#0f111a]/30 p-8">
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

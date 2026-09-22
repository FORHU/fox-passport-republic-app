"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchServiceAvailability } from "@/features/booking/api/bookings";
import AvailabilityCalendar from "@/features/booking/components/AvailabilityCalendar";

const noop = () => {};

/**
 * A Talent/Performer Foxer's own read on their service's calendar — the
 * same booked-days data the citizen's booking page shows, reused here
 * read-only (nothing is ever "selected"). No manual-block concept for
 * services today, unlike a venue's `blockedDates` — this is demand only.
 */
export function ServiceAvailabilitySection({
  serviceId,
}: {
  serviceId: string;
}) {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceAvailability(serviceId)
      .then((d) => setBookedDates(d.bookedDates))
      .catch(() => toast.error("Could not load this service's calendar."))
      .finally(() => setLoading(false));
  }, [serviceId]);

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
          Days a citizen has already booked this service — updates
          automatically as bookings come in.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-text-muted text-sm">
          Loading…
        </div>
      ) : (
        <AvailabilityCalendar
          mode="multi"
          values={[]}
          onChange={noop}
          bookedDates={bookedDates}
          accent="orange"
        />
      )}
    </div>
  );
}

export default ServiceAvailabilitySection;

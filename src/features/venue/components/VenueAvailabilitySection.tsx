"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  blockVenueDate,
  fetchVenueUnavailableDates,
  unblockVenueDate,
} from "@/features/venue/api/venues";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * A venue Foxer's own read (and, for the days they control, write) on their
 * venue's calendar — the other side of what a citizen sees greyed out on the
 * booking page. Two kinds of "unavailable" look different on purpose: a
 * citizen's real booking is locked (only cancelling the booking frees it),
 * while a day the host blocked themselves is theirs to toggle back with one
 * click, right from this calendar.
 */
export function VenueAvailabilitySection({ venueId }: { venueId: string }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string | null>(null);

  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(viewYear, viewMonth, 1);
      const end = new Date(viewYear, viewMonth + 1, 1);
      const { dates, blockedDates: blocked } =
        await fetchVenueUnavailableDates(
          venueId,
          start.toISOString(),
          end.toISOString(),
        );
      const blockedSet = new Set(blocked);
      setBlockedDates(blockedSet);
      setBookedDates(new Set(dates.filter((d) => !blockedSet.has(d))));
    } catch {
      toast.error("Could not load this venue's calendar.");
    } finally {
      setLoading(false);
    }
  }, [venueId, viewYear, viewMonth]);

  useEffect(() => {
    load();
  }, [load]);

  const cells = useMemo(() => {
    const offset = new Date(viewYear, viewMonth, 1).getDay();
    const dim = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let d = 1; d <= dim; d++) result.push(d);
    return result;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const toggleBlock = async (ds: string, isBlocked: boolean) => {
    setBusyDate(ds);
    try {
      if (isBlocked) {
        await unblockVenueDate(venueId, ds);
      } else {
        await blockVenueDate(venueId, ds);
      }
      await load();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Something went wrong";
      toast.error(message);
    } finally {
      setBusyDate(null);
    }
  };

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-white/10 bg-[#0f111a]/30 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">
              event_available
            </span>
            Availability
          </h3>
          <p className="text-xs text-text-muted">
            Pink days are already booked by a citizen. Click an open day to
            block it yourself — click it again to unblock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>
          <span className="text-sm font-bold text-white w-32 text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-white/40 font-bold py-1 tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-11" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const booked = bookedDates.has(ds);
          const blocked = blockedDates.has(ds);
          const busy = busyDate === ds;
          const clickable = !past && !booked && !busy && !loading;

          return (
            <button
              key={ds}
              type="button"
              disabled={!clickable}
              onClick={() => toggleBlock(ds, blocked)}
              title={
                booked
                  ? "Booked by a citizen"
                  : blocked
                    ? "Blocked by you — click to unblock"
                    : past
                      ? undefined
                      : "Open — click to block"
              }
              className={[
                "h-11 rounded-xl text-[13px] font-semibold transition-all duration-150 flex items-center justify-center border",
                booked
                  ? "bg-pink-500/15 border-pink-500/30 text-pink-300 cursor-not-allowed"
                  : blocked
                    ? "bg-white/10 border-white/20 text-white/70 hover:bg-white/15 cursor-pointer"
                    : past
                      ? "border-transparent text-white/15 cursor-not-allowed"
                      : "border-white/5 text-white/80 hover:border-accent/40 hover:bg-accent/5 cursor-pointer",
                busy ? "opacity-50" : "",
                ds === todayStr ? "ring-1 ring-white/50" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 text-[11px] text-white/40">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-500/40 border border-pink-500/50" />
          Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20 border border-white/30" />
          Blocked by you
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-white/10" />
          Open
        </div>
      </div>
    </div>
  );
}

export default VenueAvailabilitySection;

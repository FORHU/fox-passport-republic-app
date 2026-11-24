"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";

export function diffDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/** Local calendar date (YYYY-MM-DD) — never `toISOString()`, which is UTC and
 *  lands on the previous day east of Greenwich before midnight UTC. */
function localDateStr(d: Date) {
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

type DateField = "start" | "end";

function CompactDatePicker({
  startValue,
  endValue,
  activeField,
  onActiveFieldChange,
  onStartChange,
  onEndChange,
  onDone,
  disabledDates,
  loading = false,
}: {
  startValue: string;
  endValue: string;
  /** Which input this calendar is picking for — a click only ever sets
   *  that field (the other is cleared, never overwritten, if it stops
   *  fitting). */
  activeField: DateField;
  onActiveFieldChange: (f: DateField) => void;
  onStartChange: (d: string) => void;
  onEndChange: (d: string) => void;
  onDone: () => void;
  /** Dates (YYYY-MM-DD) that can't be picked as either endpoint — e.g. a
   *  venue's already-booked or manually blocked days. */
  disabledDates?: Set<string>;
  /** The disabled dates are still loading: nothing can be picked yet. */
  loading?: boolean;
}) {
  const today = new Date();
  const todayStr = localDateStr(today);
  // Open on the month of the date being edited, so changing an end date
  // in December doesn't start the user back in this month.
  const initialView = (() => {
    const anchor =
      (activeField === "end" ? endValue || startValue : startValue) || "";
    return anchor ? new Date(anchor + "T00:00:00") : today;
  })();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  const dim = daysInMonth(viewYear, viewMonth);
  const offset = firstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

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

  // Walks every day from `a` to `b` inclusive — matches `diffDays`, which
  // counts the end date itself as a night stayed, not a checkout-only marker.
  const rangeHasDisabledDay = (a: string, b: string) => {
    if (!disabledDates || disabledDates.size === 0) return false;
    const cursor = new Date(a + "T00:00:00");
    const last = new Date(b + "T00:00:00");
    while (cursor <= last) {
      const ds = toDateStr(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate(),
      );
      if (disabledDates.has(ds)) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  const handleClick = (ds: string) => {
    if (loading || ds < todayStr) return;
    if (disabledDates?.has(ds)) return;

    // Picking a day never closes the calendar — the user closes it with
    // Done, Escape or a click outside, so the range stays visible.
    if (activeField === "start") {
      onStartChange(ds);
      const endStillFits =
        !!endValue && endValue >= ds && !rangeHasDisabledDay(ds, endValue);
      if (endStillFits) return;
      // The old end is now before the start or spans an unavailable day:
      // clear it (never move it) and go straight on to picking the end.
      if (endValue) onEndChange("");
      onActiveFieldChange("end");
      return;
    }

    // End field: never touches the start date.
    if (startValue && ds < startValue) return;
    if (startValue && rangeHasDisabledDay(startValue, ds)) return;
    onEndChange(ds);
    if (!startValue) onActiveFieldChange("start");
  };

  const isSelected = (ds: string) => ds === startValue || ds === endValue;
  const isInRange = (ds: string) =>
    startValue && endValue && ds > startValue && ds < endValue;

  return (
    <div className="bg-surface border border-white/10 rounded-2xl shadow-xl p-4 w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform duration-200">
            chevron_left
          </span>
        </button>
        <p className="text-xs font-bold text-accent tracking-wide select-none">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-accent active:scale-90 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform duration-200">
            chevron_right
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] text-white/60 font-bold py-1 tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      <p
        aria-live="polite"
        className="text-center text-[10px] text-white/50 mb-1 select-none"
      >
        {activeField === "start" ? "Choose a start date" : "Choose an end date"}
      </p>
      {loading && (
        <p role="status" className="text-center text-[10px] text-white/50 mb-1">
          Checking availability…
        </p>
      )}
      <div
        aria-busy={loading || undefined}
        className={`grid grid-cols-7 gap-px ${loading ? "animate-pulse opacity-40 motion-reduce:animate-none" : ""}`}
      >
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />;
          const ds = toDateStr(viewYear, viewMonth, day);
          const past = ds < todayStr;
          const beforeStart =
            !past && activeField === "end" && !!startValue && ds < startValue;
          const unavailable = !past && !beforeStart && !!disabledDates?.has(ds);
          const disabledCell = past || beforeStart || unavailable;
          const sel = isSelected(ds);
          const inRange = isInRange(ds);

          return (
            <button
              key={ds}
              onClick={() => handleClick(ds)}
              disabled={loading || disabledCell}
              aria-current={ds === todayStr ? "date" : undefined}
              title={
                unavailable
                  ? "Not available on this date"
                  : beforeStart
                    ? "End date can't be before the start date"
                    : undefined
              }
              className={[
                "h-8 w-full text-[13px] font-semibold transition-all duration-150 flex items-center justify-center relative",
                inRange
                  ? "bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10"
                  : "",
                sel
                  ? "bg-accent text-black rounded-full z-10 scale-105"
                  : "",
                !sel && !disabledCell
                  ? "text-white/90 hover:bg-white/10 hover:rounded-full hover:scale-105 cursor-pointer active:scale-95"
                  : "",
                past || beforeStart ? "text-white/20 cursor-not-allowed" : "",
                unavailable
                  ? "text-red-400/50 cursor-not-allowed line-through decoration-red-400/40"
                  : "",
                ds === todayStr && !sel
                  ? "ring-1 ring-inset ring-white/30 rounded-full"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-accent hover:bg-white/10 active:scale-95 transition-all duration-200"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  errors,
  startLabel = "Start Date",
  endLabel = "End Date",
  showSummary = true,
  stacked = false,
  disabledDates,
  loading = false,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (d: string) => void;
  onEndChange: (d: string) => void;
  errors?: { dates?: string };
  startLabel?: string;
  endLabel?: string;
  showSummary?: boolean;
  stacked?: boolean;
  /** Dates (YYYY-MM-DD) that can't be picked as either endpoint or fall
   *  inside the selected range — e.g. a venue's booked/blocked days. */
  disabledDates?: Set<string>;
  /** `disabledDates` is still loading: the calendar can't be picked from yet. */
  loading?: boolean;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<DateField>("start");
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const toDisplay = (d: string) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";
  const [localStart, setLocalStart] = useState(toDisplay(startDate));
  const [localEnd, setLocalEnd] = useState(toDisplay(endDate));

  // Keep the text inputs in sync when startDate/endDate change externally
  // (e.g. a duration-preset button in a parent component), not just when
  // the user edits them directly.
  useEffect(() => {
    setLocalStart(toDisplay(startDate));
  }, [startDate]);
  useEffect(() => {
    setLocalEnd(toDisplay(endDate));
  }, [endDate]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [calendarOpen]);

  const handleCalendarStart = (d: string) => {
    onStartChange(d);
    setLocalStart(toDisplay(d));
  };

  const handleCalendarEnd = (d: string) => {
    onEndChange(d);
    setLocalEnd(toDisplay(d));
  };

  /** Typed text → YYYY-MM-DD in the user's own timezone, or null. */
  const parseTyped = (val: string): string | null => {
    const trimmed = val.trim();
    // A bare ISO date would parse as UTC midnight; read it as local, and
    // reject days that don't exist (2026-02-31 would roll into March).
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const local = new Date(trimmed + "T00:00:00");
      return !isNaN(local.getTime()) && localDateStr(local) === trimmed
        ? trimmed
        : null;
    }
    const d = new Date(trimmed.replace(/\//g, "-"));
    return trimmed && !isNaN(d.getTime()) ? localDateStr(d) : null;
  };

  const commitTypedStart = (val: string) => {
    const ds = parseTyped(val);
    if (!ds) {
      setLocalStart(toDisplay(startDate));
      return;
    }
    setLocalStart(toDisplay(ds));
    if (ds === startDate) return;
    onStartChange(ds);
    // Same rule as the calendar: an end that no longer fits is cleared,
    // never moved.
    if (endDate && endDate < ds) onEndChange("");
  };

  const commitTypedEnd = (val: string) => {
    const ds = parseTyped(val);
    if (!ds || (startDate && ds < startDate)) {
      // Unparseable, or before the start: keep the end that was there.
      setLocalEnd(toDisplay(endDate));
      return;
    }
    setLocalEnd(toDisplay(ds));
    if (ds !== endDate) onEndChange(ds);
  };

  const openCalendar = (field: DateField) => (e: React.MouseEvent) => {
    const rect = (
      e.currentTarget as HTMLElement
    ).parentElement!.getBoundingClientRect();
    const CALENDAR_W = 280;
    const CALENDAR_H = 300;
    let top = rect.bottom + 4;
    let left = rect.right - CALENDAR_W;
    if (top + CALENDAR_H > window.innerHeight) {
      top = rect.top - CALENDAR_H - 4;
    }
    if (left < 8) left = 8;
    if (left + CALENDAR_W > window.innerWidth - 8) {
      left = window.innerWidth - CALENDAR_W - 8;
    }
    setPopupPos({ top, left });
    setActiveField(field);
    setCalendarOpen(true);
  };

  const days = diffDays(startDate, endDate);

  return (
    <div className="relative">
      <div
        className={
          stacked ? "grid grid-cols-1 gap-4" : "grid sm:grid-cols-2 gap-6"
        }
      >
        <div className="space-y-2">
          <label
            htmlFor={`${fieldId}-start`}
            className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1"
          >
            {startLabel}
          </label>
          <div className="relative" ref={triggerRef}>
            <input
              id={`${fieldId}-start`}
              type="text"
              aria-invalid={errors?.dates ? true : undefined}
              aria-describedby={errors?.dates ? errorId : undefined}
              value={localStart}
              placeholder="Select date"
              onChange={(e) => setLocalStart(e.target.value)}
              onBlur={(e) => commitTypedStart(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-semibold text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-11"
            />
            <button
              type="button"
              onClick={openCalendar("start")}
              aria-label="Open calendar"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[18px]"
              >
                calendar_today
              </span>
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`${fieldId}-end`}
            className="text-xs uppercase tracking-widest text-text-muted font-bold ml-1"
          >
            {endLabel}
          </label>
          <div className="relative">
            <input
              id={`${fieldId}-end`}
              type="text"
              aria-invalid={errors?.dates ? true : undefined}
              aria-describedby={errors?.dates ? errorId : undefined}
              value={localEnd}
              placeholder="Select date"
              onChange={(e) => setLocalEnd(e.target.value)}
              onBlur={(e) => commitTypedEnd(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-semibold text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-11"
            />
            <button
              type="button"
              onClick={openCalendar("end")}
              aria-label="Open calendar"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[18px]"
              >
                calendar_today
              </span>
            </button>
          </div>
        </div>
      </div>

      {errors?.dates && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-400 mt-3 flex items-center gap-1.5"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[13px]"
          >
            error
          </span>
          {errors.dates}
        </p>
      )}
      {showSummary && startDate && endDate && !calendarOpen && (
        <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          {formatDate(startDate)} → {formatDate(endDate)} · {days} day
          {days !== 1 ? "s" : ""}
        </p>
      )}

      {calendarOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setCalendarOpen(false)}
            />
            <div
              className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
              style={{ top: popupPos.top, left: popupPos.left }}
            >
              <CompactDatePicker
                startValue={startDate}
                endValue={endDate}
                activeField={activeField}
                onActiveFieldChange={setActiveField}
                onStartChange={handleCalendarStart}
                onEndChange={handleCalendarEnd}
                onDone={() => setCalendarOpen(false)}
                disabledDates={disabledDates}
                loading={loading}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

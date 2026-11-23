"use client";

import React, { useMemo, useState } from "react";
import {
  STATUS_KEY,
  bookingDays,
  dayKey,
  eventName,
  statusInk,
  statusKind,
} from "./statusInk";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The month at a glance: a seven-column month grid on every screen size (beside
 * the heading on wide screens, below it on narrow ones), each booked day marked
 * with its bookings' status colours. Choosing a booked day jumps the agenda to it.
 *
 * `note` says where the marks come from when not every booking is loaded.
 */
export function MonthStrip({
  bookings,
  anchor,
  note,
  onPick,
}: {
  bookings: any[];
  /** The month to open on: the next booking's, or today's. */
  anchor: Date;
  /** Shown under the key, e.g. which page the past bookings come from. */
  note?: string;
  onPick: (bookingIds: string[]) => void;
}) {
  const [cursor, setCursor] = useState(
    () => new Date(anchor.getFullYear(), anchor.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const today = new Date();
  const todayKey = dayKey(today);

  const byDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of bookings) {
      for (const k of bookingDays(b)) {
        const list = map.get(k) ?? [];
        list.push(b);
        map.set(k, list);
      }
    }
    return map;
  }, [bookings]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = useMemo(() => {
    const count = new Date(year, month + 1, 0).getDate();
    return Array.from(
      { length: count },
      (_, i) => new Date(year, month, i + 1),
    );
  }, [year, month]);
  const leadingBlanks = days[0].getDay();

  const inMonth = days.flatMap((d) => byDay.get(dayKey(d)) ?? []);
  const bookedDays = days.filter((d) => byDay.has(dayKey(d))).length;
  const kindsShown = STATUS_KEY.filter((k) =>
    inMonth.some((b) => statusKind(b) === k.kind),
  );
  const isThisMonth =
    year === today.getFullYear() && month === today.getMonth();

  const shift = (n: number) => {
    setSelected(null);
    setCursor(new Date(year, month + n, 1));
  };
  const goToday = () => {
    setSelected(null);
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  };
  const pick = (k: string, list: any[]) => {
    setSelected(k);
    onPick(list.map((b) => b.id));
  };

  const dayCell = (d: Date) => {
    const k = dayKey(d);
    const list = byDay.get(k) ?? [];
    const isToday = k === todayKey;
    const isSelected = k === selected;
    const booked = list.length > 0;
    const dots = (
      <span className="flex h-2 items-center gap-1" aria-hidden>
        {list.slice(0, 3).map((b) => (
          <span
            key={b.id}
            className={`h-2 w-2 rounded-full bg-current ${statusInk(b)}`}
          />
        ))}
      </span>
    );
    const number = (
      <span
        className={`font-landing-mono flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-bold tabular-nums ${
          isToday
            ? "bg-accent text-black"
            : booked
              ? "text-white"
              : "text-white/45"
        }`}
      >
        {d.getDate()}
      </span>
    );
    // One fixed height for every cell, booked or not, so the weeks line up.
    const base =
      "flex h-14 w-full flex-col items-center justify-center gap-1 rounded-lg";

    if (!booked) {
      return (
        <span className={base}>
          {number}
          <span className="h-2" aria-hidden />
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => pick(k, list)}
        aria-pressed={isSelected}
        aria-label={`${d.toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}${isToday ? ", today" : ""}. ${list.length} ${
          list.length === 1 ? "booking" : "bookings"
        }: ${list.map((b) => eventName(b)).join(", ")}`}
        title={list.map((b) => eventName(b)).join(", ")}
        className={`${base} bg-white/6 transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text) ${
          isSelected ? "ring-2 ring-(--accent-text) ring-inset" : ""
        }`}
      >
        {number}
        {dots}
      </button>
    );
  };

  return (
    <section
      aria-labelledby="month-strip-title"
      // Stacked below lg. From lg: heading and key on the left, the grid on the right.
      className="mt-10 rounded-2xl border border-white/15 p-4 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 lg:col-start-1 lg:row-start-1 lg:flex-col lg:items-start lg:justify-start">
        {/* From lg the month controls sit under the heading, not mid-card. */}
        <div>
          <h2
            id="month-strip-title"
            className="font-landing-display text-2xl leading-[0.95] text-white sm:text-3xl"
          >
            {cursor.toLocaleDateString(undefined, { month: "long" })}{" "}
            <span className="font-landing-mono align-middle text-sm font-bold tracking-[0.12em] text-white/55">
              {year}
            </span>
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {bookedDays === 0
              ? "No bookings this month."
              : `${bookedDays} ${bookedDays === 1 ? "day" : "days"} with bookings. Select one to jump to it.`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isThisMonth && (
            <button
              type="button"
              onClick={goToday}
              className="mr-1 rounded-full border border-white/20 px-3 py-2 text-sm font-bold text-white/80 transition-colors hover:bg-white/6 hover:text-white"
            >
              This month
            </button>
          )}
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/6 hover:text-white"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/6 hover:text-white"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* The month as a seven-column grid at every width: no sideways scrolling. */}
      <div className="mt-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
        <div className="grid grid-cols-7 gap-1" aria-hidden>
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              className="text-center text-xs font-semibold text-white/50"
            >
              {w.slice(0, 2)}
            </span>
          ))}
        </div>
        <ol className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <li key={`blank-${i}`} aria-hidden />
          ))}
          {days.map((d) => (
            <li key={dayKey(d)}>{dayCell(d)}</li>
          ))}
        </ol>
      </div>

      {(kindsShown.length > 0 || note) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 lg:col-start-1 lg:row-start-2 lg:mt-6 lg:border-t-0 lg:pt-0">
          {kindsShown.map((k) => (
            <span
              key={k.kind}
              className="inline-flex items-center gap-2 text-sm text-white/70"
            >
              <span
                className={`h-2 w-2 rounded-full bg-current ${k.ink}`}
                aria-hidden
              />
              {k.label}
            </span>
          ))}
          {note && (
            <span className="text-sm text-white/55 sm:ml-auto lg:ml-0 lg:basis-full">
              {note}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

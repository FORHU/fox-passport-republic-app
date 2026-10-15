"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useCalendarBookings,
  type CalendarBooking,
} from "@/shared/hooks/useCalendarBookings";
import type { CalendarRole } from "@/shared/api/calendar";

type View = "month" | "week" | "day" | "agenda";

const ROLE_META: Record<CalendarRole, { label: string; color: string }> = {
  guest: { label: "My bookings", color: "#f59e0b" },
  host: { label: "Events I host", color: "var(--accent-text)" },
  organizer: { label: "Organizing", color: "#e879f9" },
  venue: { label: "At my venues", color: "#ec4899" },
  supplier: { label: "Supplying", color: "#38bdf8" },
};
const ROLES = Object.keys(ROLE_META) as CalendarRole[];

const HOUR_PX = 48;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfWeek = (d: Date) => addDays(startOfDay(d), -d.getDay());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Covers any part of the calendar day `day`. */
function onDay(b: CalendarBooking, day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  // A same-instant booking (no duration) still belongs to its day.
  const end =
    b.endDate > b.startDate ? b.endDate : new Date(b.startDate.getTime() + 1);
  return b.startDate < dayEnd && end > dayStart;
}

/** Shown in the all-day lane rather than the hour grid. */
function isAllDay(b: CalendarBooking) {
  const length = b.endDate.getTime() - b.startDate.getTime();
  return length >= 20 * 60 * 60 * 1000 || !sameDay(b.startDate, b.endDate);
}

const roleOf = (b: CalendarBooking): CalendarRole => b.role ?? "guest";

function timeLabel(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function rangeLabel(b: CalendarBooking) {
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (sameDay(b.startDate, b.endDate)) {
    return `${date.format(b.startDate)} · ${timeLabel(b.startDate)} – ${timeLabel(b.endDate)}`;
  }
  return `${date.format(b.startDate)} – ${date.format(b.endDate)}`;
}

/** The days a view shows, and the range to ask the API for. */
function viewDays(view: View, anchor: Date): Date[] {
  if (view === "day") return [startOfDay(anchor)];
  if (view === "week") {
    const s = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }
  if (view === "agenda") {
    const s = startOfDay(anchor);
    return Array.from({ length: 60 }, (_, i) => addDays(s, i));
  }
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const s = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(s, i));
}

/**
 * Lanes for overlapping timed bookings within one day column, so two
 * bookings at the same hour sit side by side instead of on top of each other.
 */
function layoutDay(items: CalendarBooking[]) {
  const sorted = [...items].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );
  const laneEnds: number[] = [];
  const placed = sorted.map((b) => {
    let lane = laneEnds.findIndex((end) => end <= b.startDate.getTime());
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = Math.max(
      b.endDate.getTime(),
      b.startDate.getTime() + 30 * 60 * 1000,
    );
    return { booking: b, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

/**
 * Google-Calendar-style calendar of everything the signed-in person has
 * booked, hosts, organizes, holds at their venues or supplies — month, week,
 * day and agenda views, colour-coded by role. The same component for every
 * role; what's on it is scoped by the API.
 */
export function CalendarView() {
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [hidden, setHidden] = useState<Set<CalendarRole>>(new Set());
  const [selected, setSelected] = useState<CalendarBooking | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Phones start on the agenda; a month grid of 42 cells doesn't fit.
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("agenda");
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const days = useMemo(() => viewDays(view, anchor), [view, anchor]);
  const range = useMemo(
    () => ({ from: days[0], to: addDays(days[days.length - 1], 1) }),
    [days],
  );
  const { bookings, isLoading, error } = useCalendarBookings(range);
  const visible = useMemo(
    () => bookings.filter((b) => !hidden.has(roleOf(b))),
    [bookings, hidden],
  );
  const presentRoles = useMemo(
    () => ROLES.filter((r) => bookings.some((b) => roleOf(b) === r)),
    [bookings],
  );

  const step = (direction: 1 | -1) => {
    setAnchor((a) =>
      view === "month"
        ? new Date(a.getFullYear(), a.getMonth() + direction, 1)
        : addDays(
            a,
            direction * (view === "week" ? 7 : view === "day" ? 1 : 30),
          ),
    );
  };

  const title =
    view === "day"
      ? new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(anchor)
      : new Intl.DateTimeFormat(undefined, {
          month: "long",
          year: "numeric",
        }).format(view === "month" ? anchor : days[0]);

  const toggleRole = (role: CalendarRole) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });

  const openDay = (day: Date) => {
    setAnchor(day);
    setView("day");
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-surface text-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
        <button
          type="button"
          onClick={() => setAnchor(startOfDay(new Date()))}
          className="px-4 py-1.5 rounded-full border border-white/15 text-sm font-semibold hover:bg-white/5 transition-colors cursor-pointer"
        >
          Today
        </button>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </button>
        </div>
        <h2 className="text-lg font-display font-bold mr-auto">{title}</h2>
        {isLoading && (
          <span className="text-xs text-white/40" role="status">
            Loading…
          </span>
        )}
        <div
          className="flex rounded-full border border-white/15 p-0.5"
          role="tablist"
          aria-label="Calendar view"
        >
          {(["month", "week", "day", "agenda"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                view === v
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Role legend — doubles as a filter */}
      {presentRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-white/5">
          {presentRoles.map((role) => {
            const meta = ROLE_META[role];
            const off = hidden.has(role);
            return (
              <button
                key={role}
                type="button"
                aria-pressed={!off}
                onClick={() => toggleRole(role)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-opacity cursor-pointer ${off ? "opacity-40" : ""}`}
                style={{ borderColor: `${meta.color}55`, color: meta.color }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="px-4 py-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {view === "month" && (
        <MonthGrid
          days={days}
          month={anchor.getMonth()}
          bookings={visible}
          now={now}
          onSelect={setSelected}
          onOpenDay={openDay}
        />
      )}
      {(view === "week" || view === "day") && (
        <TimeGrid
          days={days}
          bookings={visible}
          now={now}
          onSelect={setSelected}
          onOpenDay={openDay}
        />
      )}
      {view === "agenda" && (
        <Agenda
          days={days}
          bookings={visible}
          now={now}
          onSelect={setSelected}
        />
      )}

      {selected && (
        <EntryDetails booking={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function Chip({
  booking,
  onSelect,
  showTime,
}: {
  booking: CalendarBooking;
  onSelect: (b: CalendarBooking) => void;
  showTime?: boolean;
}) {
  const color = ROLE_META[roleOf(booking)].color;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(booking);
      }}
      className="w-full truncate text-left text-[11px] font-semibold rounded px-1.5 py-0.5 hover:brightness-125 transition cursor-pointer"
      style={{
        backgroundColor: `${color}26`,
        color,
        borderLeft: `3px solid ${color}`,
      }}
      title={`${booking.title} — ${rangeLabel(booking)}`}
    >
      {showTime && !isAllDay(booking) && (
        <span className="opacity-70 mr-1">{timeLabel(booking.startDate)}</span>
      )}
      {booking.title}
    </button>
  );
}

function MonthGrid({
  days,
  month,
  bookings,
  now,
  onSelect,
  onOpenDay,
}: {
  days: Date[];
  month: number;
  bookings: CalendarBooking[];
  now: Date;
  onSelect: (b: CalendarBooking) => void;
  onOpenDay: (d: Date) => void;
}) {
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-white/5">
        {days.slice(0, 7).map((d) => (
          <div
            key={d.toISOString()}
            className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-white/40"
          >
            {weekday.format(d)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {days.map((d) => {
          const items = bookings.filter((b) => onDay(b, d));
          const isToday = sameDay(d, now);
          const outside = d.getMonth() !== month;
          return (
            <div
              key={d.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onOpenDay(d)}
              onKeyDown={(e) => e.key === "Enter" && onOpenDay(d)}
              className={`min-h-[104px] border-b border-r border-white/5 p-1.5 space-y-1 cursor-pointer hover:bg-white/[0.02] ${outside ? "bg-black/30" : ""}`}
            >
              <div className="flex justify-center">
                <span
                  className={`h-6 min-w-6 px-1 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isToday
                      ? "bg-accent text-black"
                      : outside
                        ? "text-white/25"
                        : "text-white/70"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>
              {items.slice(0, 3).map((b) => (
                <Chip key={b.id} booking={b} onSelect={onSelect} showTime />
              ))}
              {items.length > 3 && (
                <p className="text-[11px] font-semibold text-white/50 px-1.5">
                  +{items.length - 3} more
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeGrid({
  days,
  bookings,
  now,
  onSelect,
  onOpenDay,
}: {
  days: Date[];
  bookings: CalendarBooking[];
  now: Date;
  onSelect: (b: CalendarBooking) => void;
  onOpenDay: (d: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Start the day at 8am, like Google Calendar, rather than midnight.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 8 * HOUR_PX - 8;
  }, []);

  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const hourLabel = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
  const cols = `56px repeat(${days.length}, minmax(0, 1fr))`;
  const allDay = days.map((d) =>
    bookings.filter((b) => isAllDay(b) && onDay(b, d)),
  );
  const hasAllDay = allDay.some((list) => list.length > 0);

  return (
    <div>
      {/* Day headers */}
      <div
        className="grid border-b border-white/5"
        style={{ gridTemplateColumns: cols }}
      >
        <div />
        {days.map((d) => {
          const isToday = sameDay(d, now);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onOpenDay(d)}
              className="py-2 flex flex-col items-center gap-0.5 cursor-pointer"
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-accent" : "text-white/40"}`}
              >
                {weekday.format(d)}
              </span>
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-lg font-display font-bold ${
                  isToday ? "bg-accent text-black" : "text-white"
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* All-day lane */}
      {hasAllDay && (
        <div
          className="grid border-b border-white/10"
          style={{ gridTemplateColumns: cols }}
        >
          <div className="text-[10px] text-white/30 text-right pr-2 pt-1.5">
            all-day
          </div>
          {allDay.map((list, i) => (
            <div key={i} className="p-1 space-y-1 border-l border-white/5">
              {list.map((b) => (
                <Chip key={b.id} booking={b} onSelect={onSelect} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Hour grid */}
      <div
        ref={scrollRef}
        className="relative overflow-y-auto"
        style={{ height: 600 }}
      >
        <div
          className="grid relative"
          style={{ gridTemplateColumns: cols, height: 24 * HOUR_PX }}
        >
          <div className="relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-white/30 -translate-y-1/2"
                style={{ top: h * HOUR_PX }}
              >
                {h === 0 ? "" : hourLabel.format(new Date(2000, 0, 1, h))}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const dayStart = startOfDay(d).getTime();
            const timed = bookings.filter((b) => !isAllDay(b) && onDay(b, d));
            const { placed, lanes } = layoutDay(timed);
            const isToday = sameDay(d, now);
            return (
              <div
                key={d.toISOString()}
                className="relative border-l border-white/5"
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-white/5"
                    style={{ top: h * HOUR_PX }}
                  />
                ))}
                {placed.map(({ booking, lane }) => {
                  const start = Math.max(booking.startDate.getTime(), dayStart);
                  const end = Math.min(
                    booking.endDate.getTime(),
                    dayStart + DAY_MS,
                  );
                  const top = ((start - dayStart) / 3_600_000) * HOUR_PX;
                  const height = Math.max(
                    ((end - start) / 3_600_000) * HOUR_PX,
                    22,
                  );
                  const color = ROLE_META[roleOf(booking)].color;
                  return (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => onSelect(booking)}
                      className="absolute rounded-md px-1.5 py-1 text-left overflow-hidden hover:brightness-125 transition cursor-pointer"
                      style={{
                        top,
                        height,
                        left: `calc(${(lane / lanes) * 100}% + 2px)`,
                        width: `calc(${100 / lanes}% - 4px)`,
                        backgroundColor: `${color}33`,
                        borderLeft: `3px solid ${color}`,
                        color,
                      }}
                    >
                      <span className="block text-[11px] font-bold truncate">
                        {booking.title}
                      </span>
                      <span className="block text-[10px] opacity-80 truncate">
                        {timeLabel(booking.startDate)} –{" "}
                        {timeLabel(booking.endDate)}
                      </span>
                    </button>
                  );
                })}
                {isToday && (
                  <div
                    className="absolute inset-x-0 z-10 pointer-events-none"
                    style={{
                      top: ((now.getTime() - dayStart) / 3_600_000) * HOUR_PX,
                    }}
                    aria-hidden="true"
                  >
                    <div className="relative h-0.5 bg-red-500">
                      <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Agenda({
  days,
  bookings,
  now,
  onSelect,
}: {
  days: Date[];
  bookings: CalendarBooking[];
  now: Date;
  onSelect: (b: CalendarBooking) => void;
}) {
  const heading = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const groups = days
    .map((d) => ({ day: d, items: bookings.filter((b) => onDay(b, d)) }))
    .filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-white/40">
        Nothing booked in the next 60 days.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-white/5">
      {groups.map(({ day, items }) => (
        <li key={day.toISOString()} className="flex gap-4 px-4 py-3">
          <span
            className={`w-24 shrink-0 text-xs font-bold pt-1 ${sameDay(day, now) ? "text-accent" : "text-white/50"}`}
          >
            {heading.format(day)}
          </span>
          <div className="flex-1 min-w-0 space-y-1.5">
            {items.map((b) => {
              const color = ROLE_META[roleOf(b)].color;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelect(b)}
                  className="w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-white/50 w-28 shrink-0">
                    {isAllDay(b)
                      ? "All day"
                      : `${timeLabel(b.startDate)} – ${timeLabel(b.endDate)}`}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">
                    {b.title}
                  </span>
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}

function EntryDetails({
  booking,
  onClose,
}: {
  booking: CalendarBooking;
  onClose: () => void;
}) {
  const meta = ROLE_META[roleOf(booking)];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-entry-title"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-3 w-3 rounded shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          <div className="min-w-0 flex-1">
            <h3
              id="calendar-entry-title"
              className="text-lg font-display font-bold text-white"
            >
              {booking.title}
            </h3>
            <p className="text-sm text-white/60 mt-1">{rangeLabel(booking)}</p>
            <p className="text-xs mt-3" style={{ color: meta.color }}>
              {meta.label}
              {booking.status && (
                <span className="text-white/40 capitalize">
                  {" · "}
                  {booking.status.replace(/_/g, " ")}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {booking.href && (
          <Link
            href={booking.href}
            className="mt-5 block text-center rounded-xl bg-accent text-black text-sm font-bold py-2.5 hover:opacity-90 transition-opacity"
          >
            Open
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/shared/auth/RequireAuth";
import {
  useCalendarBookings,
  toMonthItems,
  getIcon,
} from "@/shared/hooks/useCalendarBookings";

const MONTH_NAMES = [
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
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function ordinal(day: number) {
  if (day % 10 === 1 && day !== 11) return "st";
  if (day % 10 === 2 && day !== 12) return "nd";
  if (day % 10 === 3 && day !== 13) return "rd";
  return "th";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function HostCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { bookings, isLoading } = useCalendarBookings();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isCurrentMonth =
    month === today.getMonth() && year === today.getFullYear();

  const goToPrevYear = () => setCurrentDate(new Date(year - 1, month, 1));
  const goToNextYear = () => setCurrentDate(new Date(year + 1, month, 1));
  const goToMonth = (m: number) => setCurrentDate(new Date(year, m, 1));

  const days = useMemo(() => {
    const offset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length < 42) result.push(null);
    return result;
  }, [year, month]);

  const scheduleItems = useMemo(
    () => toMonthItems(bookings, year, month),
    [bookings, year, month],
  );

  const selectedDayBookings = useMemo(
    () => bookings.filter((b) => isSameDay(b.startDate, selectedDate)),
    [bookings, selectedDate],
  );

  return (
    <RequireAuth>
      <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 h-20 flex items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/creator-dashboard"
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-display font-bold">
                  {MONTH_NAMES[month]} {year}
                </h1>
                <p className="text-xs text-zinc-500">
                  {isLoading
                    ? "Loading…"
                    : `${scheduleItems.length} booking${scheduleItems.length !== 1 ? "s" : ""} this month`}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Legend */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#02040a]/90 backdrop-blur-sm border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            {(
              [
                { label: "Events", type: "event" },
                { label: "Venues", type: "venue" },
                { label: "Assets", type: "inventory" },
                { label: "Services", type: "service" },
              ] as const
            ).map(({ label, type }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-zinc-400">
                  {getIcon(type)}
                </span>
                <span className="text-xs text-zinc-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <main className="pt-32 pb-28 sm:pb-10 px-4">
          <div className="mx-auto max-w-7xl">
            {/* Month strip */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-8 pb-1">
              {MONTH_NAMES.map((name, i) => (
                <button
                  key={name}
                  onClick={() => goToMonth(i)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors shrink-0 ${
                    i === month
                      ? "bg-[#ccff00] text-black"
                      : "text-zinc-500 hover:text-white hover:bg-[#161920]"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-zinc-600 text-sm">
                Loading calendar…
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
                {/* Calendar grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold">
                      <span className="text-[#ccff00]">
                        {MONTH_NAMES[month]}
                      </span>{" "}
                      <span className="text-zinc-500">{year}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPrevYear}
                        aria-label="Previous year"
                        className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          chevron_left
                        </span>
                      </button>
                      <button
                        onClick={goToNextYear}
                        aria-label="Next year"
                        className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 mb-2">
                    {WEEKDAYS.map((d) => (
                      <div
                        key={d}
                        className="text-center text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider py-2"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {days.map((day, index) => {
                      if (day === null) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="aspect-square"
                          />
                        );
                      }

                      const evs = scheduleItems.filter(
                        (x) => day >= x.startDay && day <= x.endDay,
                      );
                      const cellDate = new Date(year, month, day);
                      const isToday = isCurrentMonth && day === today.getDate();
                      const isSelected = isSameDay(cellDate, selectedDate);
                      const isPast = cellDate < todayStart;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDate(cellDate)}
                          className={`rounded-2xl border aspect-square flex flex-col items-center justify-center p-2 transition-colors ${
                            isSelected
                              ? "bg-[#1c1f28] border-[#3a3f4d]"
                              : "bg-[#111318] border-[#1f2229] hover:bg-[#161920] hover:border-[#2a2e38]"
                          }`}
                        >
                          <span
                            className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                              isSelected
                                ? "bg-white text-black"
                                : isToday
                                  ? "border-2 border-sky-400 text-sky-400"
                                  : isPast
                                    ? "text-zinc-600"
                                    : "text-white"
                            }`}
                          >
                            {day}
                          </span>
                          {evs.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1">
                              {Array.from(
                                new Set(evs.map((e) => e.type)),
                              ).map((type) => (
                                <span
                                  key={type}
                                  className="material-symbols-outlined text-[11px] text-zinc-500"
                                >
                                  {getIcon(type)}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected day agenda */}
                <div className="lg:border-l lg:border-white/10 lg:pl-8">
                  <h2 className="text-2xl font-display font-bold mb-6">
                    {selectedDate.toLocaleDateString("default", {
                      weekday: "long",
                    })}
                    , {selectedDate.getDate()}
                    <sup className="text-base">
                      {ordinal(selectedDate.getDate())}
                    </sup>
                  </h2>

                  {selectedDayBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
                      <span className="material-symbols-outlined text-3xl text-zinc-700 mb-3">
                        event_busy
                      </span>
                      <p className="text-sm text-zinc-500">
                        Nothing scheduled this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayBookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 bg-[#111318] border border-[#1f2229] rounded-2xl px-4 py-3"
                        >
                          <span className="h-9 w-9 rounded-full bg-[#1f2229] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px] text-zinc-300">
                              {getIcon(b.type)}
                            </span>
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-white truncate">
                              {b.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {b.startDate.toLocaleTimeString("default", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {" - "}
                              {b.endDate.toLocaleTimeString("default", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

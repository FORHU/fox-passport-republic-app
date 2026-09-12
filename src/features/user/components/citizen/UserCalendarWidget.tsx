"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  useCalendarBookings,
  toMonthItems,
  type CalendarBooking,
} from "@/shared/hooks/useCalendarBookings";

interface UserCalendarWidgetProps {
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isMine(type: CalendarBooking["type"]) {
  return type === "event" || type === "venue";
}

export const UserCalendarWidget: React.FC<UserCalendarWidgetProps> = ({
  className = "",
}) => {
  const { bookings, isLoading } = useCalendarBookings();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const isCurrentMonth =
    month === today.getMonth() && year === today.getFullYear();

  const goToPrevMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date(year, month - 1, 1));
  };
  const goToNextMonth = () => {
    setSelectedDay(null);
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthItems = useMemo(
    () => toMonthItems(bookings, year, month),
    [bookings, year, month],
  );

  const cells = useMemo(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    const offset = new Date(year, month, 1).getDay();
    const result: (number | null)[] = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let d = 1; d <= dim; d++) result.push(d);
    while (result.length < 42) result.push(null);
    return result;
  }, [year, month]);

  const dayHasType = (day: number, mine: boolean) =>
    monthItems.some(
      (item) =>
        day >= item.startDay &&
        day <= item.endDay &&
        isMine(item.type) === mine,
    );

  const selectedItems =
    selectedDay !== null
      ? monthItems.filter(
          (item) => selectedDay >= item.startDay && selectedDay <= item.endDay,
        )
      : [];

  return (
    <section className={`reveal-on-scroll flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">
            calendar_month
          </span>
          My Calendar
        </h3>
        <Link
          href="/creator-dashboard/calendar"
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          Full Calendar{" "}
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-5 flex flex-col flex-1 h-full">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>
          <p className="text-sm font-bold text-white">
            {viewDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={goToNextMonth}
            className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[9px] text-white/40 font-bold py-1 tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="h-9" />;
            const isToday = isCurrentMonth && day === today.getDate();
            const mine = dayHasType(day, true);
            const received = dayHasType(day, false);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="h-9 flex flex-col items-center justify-center gap-0.5 group"
              >
                <span
                  className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-white text-black"
                      : isToday
                        ? "border-2 border-sky-400 text-sky-400"
                        : "text-white/80 group-hover:bg-white/10"
                  }`}
                >
                  {day}
                </span>
                <span className="flex items-center gap-0.5 h-1">
                  {mine && (
                    <span className="h-1 w-1 rounded-full bg-accent" />
                  )}
                  {received && (
                    <span className="h-1 w-1 rounded-full bg-purple-400" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[10px] text-white/50">My Bookings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-[10px] text-white/50">Booked by Others</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-sky-400" />
            <span className="text-[10px] text-white/50">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            <span className="text-[10px] text-white/50">Selected</span>
          </div>
        </div>

        <div className="mt-3 flex-1 min-h-[64px]">
          {isLoading ? (
            <p className="text-xs text-text-muted text-center py-4">
              Loading…
            </p>
          ) : selectedDay !== null && selectedItems.length > 0 ? (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      isMine(item.type) ? "bg-accent" : "bg-purple-400"
                    }`}
                  />
                  <span className="text-xs text-white font-medium truncate flex-1">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {isMine(item.type) ? "Yours" : "Booked by someone"}
                  </span>
                </div>
              ))}
            </div>
          ) : selectedDay !== null ? (
            <p className="text-xs text-text-muted text-center py-4">
              Nothing scheduled this day.
            </p>
          ) : monthItems.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">
              No bookings this month.
            </p>
          ) : (
            <p className="text-xs text-text-muted text-center py-4">
              Tap a highlighted day to see details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

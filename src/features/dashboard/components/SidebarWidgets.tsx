"use client";

import React from "react";
import Link from "next/link";
import {
  useCalendarBookings,
  toMonthItems,
  getDotColor,
} from "@/shared/hooks/useCalendarBookings";

export function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDay = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Offset so the grid starts on Monday
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const { bookings, isLoading } = useCalendarBookings();
  const scheduleItems = toMonthItems(bookings, year, month);

  return (
    <Link
      href="/creator-dashboard/calendar"
      className="block bg-surface border border-white/5 rounded-[2rem] p-6 cursor-pointer group hover:border-white/10 transition-colors"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">
            calendar_month
          </span>
          {monthLabel}
        </h3>
        <span className="material-symbols-outlined text-white/40 group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-white/40">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Leading empty cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const evs = isLoading
            ? []
            : scheduleItems.filter((x) => day >= x.startDay && day <= x.endDay);
          const isToday = day === todayDay;

          return (
            <div
              key={day}
              className={`rounded-lg h-9 flex flex-col items-center justify-center relative ${
                isToday
                  ? "bg-accent text-black font-bold shadow-[0_0_10px_#ccff00]"
                  : evs.length
                    ? "text-white font-bold"
                    : "text-white/40"
              }`}
            >
              <span>{day}</span>
              {evs.length > 0 && !isToday && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {evs.slice(0, 3).map((e, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full ${getDotColor(e.type)}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

export function CreatorProfile() {
  return (
    <div className="bg-surface border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
      <h3 className="relative z-10 font-display font-bold mb-6">
        Creator Profile
      </h3>
      <Link
        href="/user/settings"
        className="relative z-10 w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left group"
      >
        <div className="h-9 w-9 rounded-lg bg-surface-raised border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:text-accent">
          <span className="material-symbols-outlined text-[18px]">
            settings
          </span>
        </div>
        <span className="text-sm font-medium">Settings</span>
      </Link>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/authentication/RequireAuth';
import { SCHEDULE_ITEMS } from '@/data/dashboardData';

export default function HostCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const days = [];

    // Empty cells for before first day (assuming Monday start, adjust if Sunday)
    const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // Fill to complete the grid (7x6 = 42)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

  const getIcon = (type: string) =>
    type === 'event' ? 'event' : type === 'venue' ? 'apartment' : 'inventory_2';
  const getBgColor = (type: string) =>
    type === 'event'
      ? 'bg-[#ccff00] text-black'
      : type === 'venue'
      ? 'bg-pink-500 text-white'
      : 'bg-orange-400 text-black';

  return (
    <RequireAuth>
      <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/host"
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-display font-bold">{currentMonth}</h1>
                <p className="text-xs text-white/50">Host Calendar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button onClick={goToPrevMonth} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={goToNextMonth} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <button className="px-4 py-2 rounded-full bg-[#ccff00] text-black font-bold text-sm hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Event
              </button>
            </div>
          </div>
        </header>

        {/* Legend */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#02040a]/90 backdrop-blur-sm border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-white/70">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-white/70">Venues</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-white/70">Assets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-white/70">Services</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <main className="pt-36 pb-10 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[calc(100vh-200px)]">
              {/* Day Headers */}
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                <div
                  key={d}
                  className="bg-[#1a1d2d] p-4 text-center text-xs font-bold text-white/40 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => {
                if (day === null) {
                  return (
                    <div key={index} className="bg-[#0f111a]/30" />
                  );
                }

                const evs = SCHEDULE_ITEMS.filter((x) => day >= x.startDay && day <= x.endDay);
                const isToday = isCurrentMonth && day === today.getDate();

                return (
                  <div
                    key={day}
                    className="bg-[#0f111a] border-b border-r border-white/5 flex flex-col relative group hover:bg-white/5 min-h-[120px]"
                  >
                    <div
                      className={`mx-3 mt-3 mb-2 text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg ${
                        isToday
                          ? 'bg-[#ccff00] text-black shadow-[0_0_10px_#ccff00]'
                          : 'text-white/50'
                      }`}
                    >
                      {day}
                    </div>
                    <div className="flex flex-col gap-1 px-2 pb-2">
                      {evs.map((e) => {
                        const isStart = day === e.startDay;
                        const isEnd = day === e.endDay;

                        const roundedClass =
                          isStart && isEnd
                            ? 'rounded-md mx-0'
                            : isStart
                            ? 'rounded-l-md rounded-r-none -mr-2'
                            : isEnd
                            ? 'rounded-r-md rounded-l-none -ml-2'
                            : 'rounded-none -mx-2';

                        return isStart ? (
                          <div
                            key={e.id}
                            className={`${getBgColor(
                              e.type
                            )} text-[11px] font-bold py-1.5 px-2 flex items-center gap-1 truncate h-[26px] cursor-pointer hover:brightness-110 transition-all ${roundedClass}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {getIcon(e.type)}
                            </span>
                            {e.title}
                          </div>
                        ) : (
                          <div
                            key={e.id}
                            className={`${getBgColor(e.type)} h-[26px] cursor-pointer hover:brightness-110 transition-all ${roundedClass}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
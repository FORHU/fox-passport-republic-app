'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/authentication/RequireAuth';
import {
  useCalendarBookings,
  toMonthItems,
  getBgColor,
  getIcon,
  getDotColor,
} from '@/hooks/calendar/useCalendarBookings';

export default function HostCalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { bookings, isLoading } = useCalendarBookings();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
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

  const today = new Date();
  const isCurrentMonth =
    month === today.getMonth() && year === today.getFullYear();

  return (
    <RequireAuth>
      <div className="bg-[#02040a] text-white min-h-screen font-body antialiased">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/creator-dashboard"
                className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-2xl font-display font-bold">{currentMonth}</h1>
                <p className="text-xs text-white/50">
                  {isLoading ? 'Loading…' : `${scheduleItems.length} booking${scheduleItems.length !== 1 ? 's' : ''} this month`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={goToPrevMonth}
                  className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={goToNextMonth}
                  className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Legend */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#02040a]/90 backdrop-blur-sm border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            {(
              [
                { label: 'Events',    dot: getDotColor('event') },
                { label: 'Venues',    dot: getDotColor('venue') },
                { label: 'Assets',    dot: getDotColor('inventory') },
                { label: 'Services',  dot: getDotColor('service') },
              ] as const
            ).map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${dot}`} />
                <span className="text-xs text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <main className="pt-36 pb-10 px-4">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-white/30 text-sm">
                Loading calendar…
              </div>
            ) : (
              <div className="grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[calc(100vh-200px)]">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                  <div
                    key={d}
                    className="bg-[#1a1d2d] p-4 text-center text-xs font-bold text-white/40 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}

                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="bg-[#0f111a]/30" />;
                  }

                  const evs = scheduleItems.filter(
                    (x) => day >= x.startDay && day <= x.endDay,
                  );
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
                            isStart && isEnd ? 'rounded-md mx-0'
                            : isStart        ? 'rounded-l-md rounded-r-none -mr-2'
                            : isEnd          ? 'rounded-r-md rounded-l-none -ml-2'
                            :                  'rounded-none -mx-2';

                          return isStart ? (
                            <div
                              key={e.id}
                              className={`${getBgColor(e.type)} text-[11px] font-bold py-1.5 px-2 flex items-center gap-1 truncate h-[26px] cursor-pointer hover:brightness-110 transition-all ${roundedClass}`}
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
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

'use client';

import React from 'react';

interface Props {
  bookingsByDay: number[];
  categoryStats: { category: string; count: number }[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COLORS = [
  { bar: 'bg-secondary', glow: 'rgba(219,39,119,0.8)' },
  { bar: 'bg-accent',    glow: 'rgba(204,255,0,0.8)'  },
  { bar: 'bg-primary',   glow: 'rgba(124,58,237,0.8)' },
  { bar: 'bg-blue-400',  glow: 'rgba(96,165,250,0.8)' },
  { bar: 'bg-orange-400',glow: 'rgba(251,146,60,0.8)' },
];

function fmtCategory(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const AdminChartsSection: React.FC<Props> = ({ bookingsByDay, categoryStats }) => {
  const maxDay = Math.max(...bookingsByDay, 1);
  const todayIdx = new Date().getDay();

  const totalCatBookings = categoryStats.reduce((s, c) => s + c.count, 0) || 1;
  const topCats = [...categoryStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const isEmpty = bookingsByDay.every(v => v === 0);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Bar chart — bookings per day of week */}
      <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 border border-white/5">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Booking Activity</h3>
            <p className="text-sm text-text-muted">Bookings by day of week (last 30 days)</p>
          </div>
          {isEmpty && (
            <span className="text-xs text-white/30 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              No data yet
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-white/20">
            <span className="material-symbols-outlined text-[48px]">bar_chart</span>
            <p className="text-sm">Bookings will appear here once recorded.</p>
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {bookingsByDay.map((count, i) => {
              const pct = maxDay > 0 ? Math.max(4, Math.round((count / maxDay) * 100)) : 4;
              const isToday = i === todayIdx;
              return (
                <div key={i} className="w-full flex flex-col justify-end group gap-2 h-full" title={`${DAY_LABELS[i]}: ${count} bookings`}>
                  <div
                    className="w-full bg-surface-highlight rounded-t-lg relative overflow-hidden transition-all duration-500 ease-out"
                    style={{ height: `${pct}%` }}
                  >
                    <div className={`absolute inset-0 bg-linear-to-t ${isToday ? 'from-accent/50 to-accent/80 opacity-80' : 'from-primary/50 to-primary/80 opacity-60'} group-hover:opacity-100 transition-opacity ${isToday ? 'shadow-[0_0_20px_rgba(204,255,0,0.2)]' : ''}`} />
                    {count > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/50 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs text-center ${isToday ? 'text-white font-bold' : 'text-gray-500 font-medium'}`}>
                    {DAY_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category distribution */}
      <div className="glass-panel rounded-[2rem] p-8 border border-white/5 flex flex-col h-full">
        <h3 className="text-xl font-display font-bold text-white mb-6">Event Categories</h3>

        {topCats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20">
            <span className="material-symbols-outlined text-[48px]">category</span>
            <p className="text-sm text-center">Category data will appear once events are created.</p>
          </div>
        ) : (
          <div className="space-y-6 flex-1">
            {topCats.map((cat, i) => {
              const pct = Math.round((cat.count / totalCatBookings) * 100);
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={cat.category} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-medium text-white flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${color.bar} shrink-0`} style={{ boxShadow: `0 0 8px ${color.glow}` }} />
                      {fmtCategory(cat.category)}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors tabular-nums">
                      {pct}% <span className="text-xs text-white/20">({cat.count})</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%`, boxShadow: `0 0 10px ${color.glow.replace('0.8', '0.4')}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-xs text-white/30 border-t border-white/5 pt-4">
          <span>{categoryStats.length} categories total</span>
          <span>{categoryStats.reduce((s, c) => s + c.count, 0)} events</span>
        </div>
      </div>
    </div>
  );
};

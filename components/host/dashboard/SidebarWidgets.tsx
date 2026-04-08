import React from 'react';
import Link from 'next/link';
import { SCHEDULE_ITEMS, RECENT_ACTIVITY } from '@/data/dashboardData';

export function CalendarWidget() {
  const today = 3;

  return (
    <Link
      href="/host/calendar"
      className="block bg-[#0f111a] border border-white/5 rounded-[2rem] p-6 cursor-pointer group hover:border-white/10 transition-colors"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          October 2024
        </h3>
        <span className="material-symbols-outlined text-white/40 group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-white/40">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        <div />
        {[...Array(31)].map((_, i) => {
          const day = i + 1;
          const evs = SCHEDULE_ITEMS.filter((x) => day >= x.startDay && day <= x.endDay);
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`rounded-lg h-9 flex flex-col items-center justify-center relative ${
                isToday
                  ? 'bg-[#ccff00] text-black font-bold shadow-[0_0_10px_#ccff00]'
                  : evs.length
                  ? 'text-white font-bold'
                  : 'text-white/40'
              }`}
            >
              <span>{day}</span>
              {evs.length > 0 && !isToday && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {evs.slice(0, 3).map((e, idx) => (
                    <div key={idx} className={`w-1 h-1 rounded-full ${e.color}`} />
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
    <div className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
      <div className="relative z-10 flex justify-between items-center mb-6">
        <h3 className="font-display font-bold">Creator Profile</h3>
        <span className="text-xs font-bold bg-[#ccff00]/20 text-[#ccff00] px-3 py-1 rounded-full">
          85% Complete
        </span>
      </div>
      <div className="relative z-10 space-y-2">
        {[
          { i: 'folder_shared', t: 'Portfolio' },
          { i: 'settings', t: 'Settings' },
          { i: 'support_agent', t: 'Creator Support' },
        ].map((x, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left group"
          >
            <div className="h-9 w-9 rounded-lg bg-[#1a1d2d] border border-white/10 flex items-center justify-center group-hover:border-[#ccff00] group-hover:text-[#ccff00]">
              <span className="material-symbols-outlined text-[18px]">{x.i}</span>
            </div>
            <span className="text-sm font-medium">{x.t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RecentActivity() {
  const getActivityStyles = (type: string) => {
    switch (type) {
      case 'booking':
        return { bg: 'bg-[#ccff00]/20', text: 'text-[#ccff00]', icon: 'confirmation_number' };
      case 'venue':
        return { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: 'apartment' };
      case 'inventory':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'inventory' };
      default:
        return { bg: 'bg-white/20', text: 'text-white', icon: 'info' };
    }
  };

  return (
    <div className="bg-[#0f111a] border border-white/5 rounded-[2rem] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-bold">Recent Activity</h3>
        <button className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black">
          <span className="material-symbols-outlined text-[14px]">more_horiz</span>
        </button>
      </div>
      <div className="space-y-4">
        {RECENT_ACTIVITY.map((activity) => {
          const styles = getActivityStyles(activity.type);
          return (
            <div key={activity.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
              <div className={`h-10 w-10 rounded-full ${styles.bg} flex items-center justify-center ${styles.text}`}>
                <span className="material-symbols-outlined text-[18px]">{styles.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-bold">{activity.title}</p>
                  <span className="text-[10px] text-white/40">{activity.time}</span>
                </div>
                <p className="text-xs text-white/50">{activity.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-6 py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest">
        View All Activity
      </button>
    </div>
  );
}

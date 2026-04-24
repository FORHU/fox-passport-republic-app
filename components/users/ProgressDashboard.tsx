'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProgressDashboardProps {
  user: any;
}

const ROLE_ITEMS = [
  {
    key: 'foxerAsset',
    aliases: ['foxer', 'foxerService'],
    label: 'Foxer',
    sub: 'Social Butterfly',
    color: '#f97316',
    level: 12,
    xpCurrent: 2400,
    xpRequired: 3000,
    applyHref: '/onboarding',
  },
  {
    key: 'mayor',
    aliases: [],
    label: 'Mayor',
    sub: 'Venue Curator',
    color: '#3b82f6',
    level: 5,
    xpCurrent: 450,
    xpRequired: 1000,
    applyHref: '/onboarding',
  },
  {
    key: 'host',
    aliases: [],
    label: 'Host',
    sub: 'Trailblazer',
    color: '#22c55e',
    level: 18,
    xpCurrent: 4500,
    xpRequired: 5000,
    applyHref: '/creator-dashboard/apply',
  },
  {
    key: 'investor',
    aliases: [],
    label: 'Investor',
    sub: 'Seed Funder',
    color: '#eab308',
    level: 2,
    xpCurrent: 150,
    xpRequired: 1000,
    applyHref: '/onboarding',
  },
];

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ user }) => {
  const router = useRouter();

  const sysRole = (user?.systemRole || user?.role || '').toLowerCase();
  const roleTypes: string[] = user?.roleType ?? [];
  const isAdmin = sysRole === 'admin' || sysRole === 'super_admin';

  const isUnlocked = (item: typeof ROLE_ITEMS[0]) => {
    if (isAdmin) return true;
    return [item.key, ...item.aliases].some((r) => roleTypes.includes(r));
  };

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-3">
          Progress <span className="text-[#ccff00]">Dashboard</span>
        </h2>
        <p className="text-white/50 text-lg">Track your journey across FoxPassport.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ROLE_ITEMS.map((item) => {
          const unlocked = isUnlocked(item);
          const progressPct = item.xpCurrent / item.xpRequired;
          const circumference = 440;
          const dashOffset = circumference - circumference * ((item.level % 10) / 10);

          return (
            <div
              key={item.key}
              onClick={() => !unlocked && router.push(item.applyHref)}
              className={`bg-[#1a1a24] rounded-[2.5rem] p-8 flex flex-col items-center border border-white/5 transition-all duration-300 ${
                unlocked
                  ? 'hover:-translate-y-2 hover:border-white/20 cursor-default'
                  : 'opacity-60 grayscale hover:opacity-80 cursor-pointer group'
              }`}
            >
              {/* Ring */}
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80" cy="80" r="70" fill="transparent"
                    stroke="currentColor" strokeWidth="8"
                    className="text-white/5"
                  />
                  {unlocked && (
                    <circle
                      cx="80" cy="80" r="70" fill="transparent"
                      stroke={item.color} strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  {unlocked ? (
                    <>
                      <span className="text-4xl font-display font-bold text-white">
                        {item.level < 10 ? `0${item.level}` : item.level}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Level</span>
                    </>
                  ) : (
                    <Lock className="w-10 h-10 text-white/30 group-hover:text-white/50 transition-colors" />
                  )}
                </div>
              </div>

              {/* Label */}
              <h3 className="text-2xl font-display font-bold text-white mb-1">{item.label}</h3>

              {unlocked ? (
                <>
                  <p className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: item.color }}>
                    {item.sub}
                  </p>
                  {/* XP bar */}
                  <div className="w-full space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${progressPct * 100}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/5 text-xs font-mono text-gray-300 text-center">
                      XP: {item.xpCurrent.toLocaleString()} / {item.xpRequired.toLocaleString()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold mb-3 uppercase tracking-wide text-white/30">Locked</p>
                  <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/5 text-xs font-mono text-white/20 text-center w-full">
                    XP: ??? / ???
                  </div>
                  <p className="text-[10px] text-white/20 group-hover:text-[#ccff00]/60 transition-colors mt-2 uppercase tracking-widest">
                    Click to apply
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

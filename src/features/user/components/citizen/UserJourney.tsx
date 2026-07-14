'use client';

import { useRouter } from 'next/navigation';
import { useMyPassport } from '@/features/gamification/hooks/usePassport';
import { initializePathProgress } from '@/features/gamification/lib/gamification';

interface UserJourneyProps {
  userName?: string;
  navigateToPassport: () => void;
  className?: string;
}

const MILESTONES = [
  { label: 'Traveler', level: 1,  color: '#10b981', pct: 0 },
  { label: 'Citizen',  level: 10, color: '#bef264', pct: 50 },
  { label: 'Diplomat', level: 20, color: '#ffffff', pct: 100 },
];

export const UserJourney: React.FC<UserJourneyProps> = ({ userName, navigateToPassport, className = '' }) => {
  const router = useRouter();
  const { paths, isLoading } = useMyPassport();

  const citizenPath = paths.find(p => p.path === 'user') ?? initializePathProgress('user');
  const { level, currentXP, requiredXP } = citizenPath;

  // Plane position: 0% = Lvl 1, 50% = Lvl 10, 100% = Lvl 20
  const progressPct = Math.min(100, Math.max(0, ((level - 1 + currentXP / Math.max(1, requiredXP)) / 19) * 100));

  // Milestone status
  const currentMilestone = level >= 20 ? MILESTONES[2] : level >= 10 ? MILESTONES[1] : MILESTONES[0];
  const nextMilestone = level >= 20 ? null : level >= 10 ? MILESTONES[2] : MILESTONES[1];
  const xpToNext = requiredXP - currentXP;

  const handleViewPassport = () => {
    router.push('/user/passport');
  };

  return (
    <section className={`reveal-on-scroll flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#10b981]">flight_takeoff</span>
          My Journey
        </h3>
        <button
          onClick={handleViewPassport}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          View Passport <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-[2.5rem] bg-[#0f392b] border border-[#10b981]/20 p-6 shadow-glow hover:scale-[1.02] transition-transform duration-300 cursor-pointer group flex-1 h-full"
        onClick={handleViewPassport}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-24 bg-[#10b981] opacity-20 blur-[80px] rounded-full group-hover:opacity-30 transition-opacity"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-white tracking-tight">{userName || 'Citizen'}</h3>
              {isLoading ? (
                <p className="text-white/40 text-sm">Loading…</p>
              ) : (
                <p className="text-white/60 text-sm">
                  Level {level} • <span className="text-[#bef264] font-bold">{currentMilestone.label}</span>
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#10b981] group-hover:text-[#022c22] transition-colors relative">
              <span className="material-symbols-outlined text-white group-hover:text-[#022c22] z-10">verified</span>
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#10b981]/50 animate-spin-slow"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative pt-2 pb-12 w-full">
              {/* Track */}
              <div className="absolute top-[14px] left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full"></div>

              {/* Progress fill */}
              <div
                className="absolute top-[14px] left-0 h-1 bg-linear-to-r from-[#10b981] to-[#bef264] -translate-y-1/2 rounded-full shadow-[0_0_10px_#10b981] transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              ></div>

              {/* Plane indicator */}
              {!isLoading && (
                <div className="absolute top-[14px] z-20 transition-all duration-1000" style={{ left: `${progressPct}%` }}>
                  <div className="relative" style={{ animation: 'fly 3s ease-in-out infinite' }}>
                    <div className="absolute -translate-x-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined text-[#bef264] text-3xl drop-shadow-[0_0_10px_rgba(190,242,100,0.8)] rotate-90">flight</span>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-[#bef264] bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm border border-[#bef264]/30">
                        You (Lvl {level})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Milestone dots */}
              <div className="relative flex justify-between text-xs font-bold w-full">
                {MILESTONES.map((m) => {
                  const reached = level >= m.level;
                  return (
                    <div key={m.label} className="flex flex-col items-center gap-2 relative z-10">
                      <div
                        className="rounded-full border-2"
                        style={{
                          width: m.level === 10 ? 16 : 12,
                          height: m.level === 10 ? 16 : 12,
                          backgroundColor: reached ? m.color : 'rgba(255,255,255,0.2)',
                          borderColor: reached ? m.color : 'transparent',
                          boxShadow: reached ? `0 0 10px ${m.color}` : 'none',
                        }}
                      ></div>
                      <div className="flex flex-col items-center">
                        <span style={{ color: reached ? m.color : 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                        <span className="text-[10px] font-normal" style={{ color: reached ? `${m.color}99` : 'rgba(255,255,255,0.2)' }}>
                          Lvl {m.level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex justify-between items-center">
              {isLoading ? (
                <span className="text-xs text-white/30">Loading XP…</span>
              ) : nextMilestone ? (
                <div className="text-xs text-white/70">
                  <span className="text-[#bef264] font-bold">{xpToNext.toLocaleString()} XP</span> to Level {level + 1}
                </div>
              ) : (
                <div className="text-xs text-[#bef264] font-bold">Max Level Reached</div>
              )}
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Keep Booking
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

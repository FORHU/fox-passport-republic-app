'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@/features/gamification/components/CircularProgress';
import { BadgeGrid } from '@/features/gamification/components/BadgeCard';
import { PassportGrid } from '@/features/gamification/components/PassportStamp';
import {
  UserPath,
  XP_REWARDS,
} from '@/features/gamification/types/gamification';
import {
  calculateMasteryLevel,
  formatXP,
} from '@/features/gamification/lib/gamification';
import BadgeModal from '@/features/gamification/components/BadgeModal';
import { Badge } from '@/features/gamification/types/gamification';
import { useMyPassport } from '@/features/gamification/hooks/usePassport';

interface ProgressDashboardProps {
  user: any;
  showPassport?: boolean;
  showHeader?: boolean;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  user: _user,
  showPassport = true,
  showHeader = true
}) => {
  const router = useRouter();
  const [_selectedPath, setSelectedPath] = useState<UserPath | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { paths, stamps, badges, isLoading } = useMyPassport();

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const masteryLevel = calculateMasteryLevel(paths);
  const totalXP = paths.reduce((sum, path) => sum + path.totalXP, 0);
  const maxTotalXP = Math.max(totalXP * 1.2, 1000);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <span className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
              <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                Online • Main Server
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[0.85]">
              Progress <br />
              <span className="text-[#ccff00] underline decoration-[#ccff00]/20">Dashboard</span>
            </h1>

            <p className="text-white/50 text-lg max-w-xl font-light">
              Track your journey across FoxPassport. Level up your paths to unlock exclusive perks
              and venue access.
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] min-w-[320px] border-t border-white/10 shadow-glow relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-full h-full bg-[#ccff00]/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#ccff00]/10 transition-all duration-500"></div>

            <div className="relative z-10 flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                Total Mastery
              </span>
              <span className="text-[#ccff00] text-2xl">⭐</span>
            </div>

            <div className="text-5xl font-display font-bold text-white mb-4">Lvl {masteryLevel}</div>

            <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-linear-to-r from-[#ccff00] to-green-500 h-full rounded-full shadow-[0_0_10px_#ccff00]"
                style={{ width: `${Math.min((totalXP / maxTotalXP) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="text-xs text-right text-white/40 font-mono tracking-wider">
              {formatXP(totalXP)} XP total
            </div>
          </div>
        </div>
      )}

      {/* Path Circular Progress Grid */}
      {paths.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {paths.map((path) => (
            <div
              key={path.path}
              onClick={() => setSelectedPath(path.path)}
              className="glass-panel rounded-[3rem] p-10 flex flex-col items-center group hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              <CircularProgress
                level={path.level}
                currentXP={path.currentXP}
                requiredXP={path.requiredXP}
                color={path.color}
                size={192}
                strokeWidth={12}
                className="mb-8"
              />

              <h3 className="text-2xl font-display font-bold text-white mb-1 capitalize">
                {path.path}
              </h3>

              <p
                className="text-sm font-bold uppercase tracking-wider mb-6"
                style={{ color: path.color }}
              >
                {path.label}
              </p>

              <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/5 font-mono text-[10px] text-white/50 tracking-widest">
                XP: <span className="text-white">{formatXP(path.currentXP)}</span> /{' '}
                {formatXP(path.requiredXP)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-20 glass-panel rounded-[3rem] p-10 text-center text-white/40">
          <p>Complete bookings to start earning XP on your paths.</p>
        </div>
      )}

      {/* Badges Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ccff00] text-[32px]">award_star</span>
            Recent Drops <span className="text-[#ccff00]">&</span> Badges
          </h2>
          <button onClick={() => router.push('/user/passport')} className="text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
            View Collection
            <span className="text-[16px] group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {badges.length > 0 ? (
          <BadgeGrid
            badges={badges.slice(0, 4)}
            maxDisplay={4}
            className="lg:grid-cols-4"
            onBadgeClick={handleBadgeClick}
          />
        ) : (
          <p className="text-white/40 text-sm">No badges earned yet.</p>
        )}
      </section>

      {/* Passport Stamps Section */}
      {showPassport && (
        <section className="mt-20 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">
                My <span className="text-[#ccff00]">Passport</span>
              </h2>
              <p className="text-white/50">Collection of events you&apos;ve attended</p>
            </div>
            <button onClick={() => router.push('/user/passport')} className="text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
              View All
              <span className="text-[16px] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {stamps.length > 0 ? (
            <PassportGrid stamps={stamps} />
          ) : (
            <p className="text-white/40 text-sm">Attend events to collect passport stamps.</p>
          )}
        </section>
      )}

      {/* XP Rewards Info */}
      <section className="mt-20 glass-panel rounded-[3rem] p-10">
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          How to Earn XP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#ccff00]">User Path</h3>
            <ul className="space-y-1 text-sm text-white/50">
              <li>• Book an event: +{XP_REWARDS.bookEvent} XP</li>
              <li>• Attend an event: +{XP_REWARDS.attendEvent} XP</li>
              <li>• Leave a review: +{XP_REWARDS.leaveReview} XP</li>
              <li>• Refer a friend: +{XP_REWARDS.referFriend} XP</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#ccff00]">Foxer Path</h3>
            <ul className="space-y-1 text-sm text-white/50">
              <li>• Create listing: +{XP_REWARDS.createListing} XP</li>
              <li>• Listing booked: +{XP_REWARDS.listingBooked} XP</li>
              <li>• Complete event: +{XP_REWARDS.completeEvent} XP</li>
              <li>• 5-star review: +{XP_REWARDS.receive5StarReview} XP</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#ccff00]">Host Path</h3>
            <ul className="space-y-1 text-sm text-white/50">
              <li>• Upload venue: +{XP_REWARDS.uploadVenue} XP</li>
              <li>• Venue booked: +{XP_REWARDS.venueBooked} XP</li>
              <li>• Venue featured: +{XP_REWARDS.venueFeatured} XP</li>
            </ul>
          </div>
        </div>
      </section>

      <BadgeModal
        badge={selectedBadge}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

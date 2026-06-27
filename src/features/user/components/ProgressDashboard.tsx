'use client';

import React, { useState } from 'react';
import CircularProgress from '@/features/gamification/components/CircularProgress';
import { BadgeGrid } from '@/features/gamification/components/BadgeCard';
import { PassportGrid } from '@/features/gamification/components/PassportStamp';
import {
  PathProgress,
  UserPath,
  XP_REWARDS,
} from '@/features/gamification/types/gamification';
import {
  calculateMasteryLevel,
  formatXP,
} from '@/features/gamification/lib/gamification';
import { MOCK_BADGES, MOCK_PASSPORT_STAMPS } from '@/features/gamification/lib/gamification-data';
import BadgeModal from '@/features/gamification/components/BadgeModal';
import { Badge } from '@/features/gamification/types/gamification';

interface ProgressDashboardProps {
  user: any;
  showPassport?: boolean;
  showHeader?: boolean;
}

// Mock data - will be replaced with actual API calls
const mockPaths: PathProgress[] = [
  {
    path: 'foxer',
    level: 12,
    currentXP: 2400,
    requiredXP: 3000,
    totalXP: 14400,
    label: 'Social Butterfly',
    color: '#f97316',
  },
  {
    path: 'host',
    level: 5,
    currentXP: 450,
    requiredXP: 1000,
    totalXP: 4450,
    label: 'Venue Curator',
    color: '#3b82f6',
  },
  {
    path: 'user',
    level: 18,
    currentXP: 4500,
    requiredXP: 5000,
    totalXP: 45000,
    label: 'Trailblazer',
    color: '#22c55e',
  },
  {
    path: 'investor',
    level: 2,
    currentXP: 150,
    requiredXP: 1000,
    totalXP: 1150,
    label: 'Seed Funder',
    color: '#eab308',
  },
];

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ 
  user, 
  showPassport = true, 
  showHeader = true 
}) => {
  const [selectedPath, setSelectedPath] = useState<UserPath | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const masteryLevel = calculateMasteryLevel(mockPaths);
  const totalXP = mockPaths.reduce((sum, path) => sum + path.totalXP, 0);
  const maxTotalXP = 65000; // Mock max for demo

  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
              <span className="text-[10px] font-mono text-white/70 tracking-widest uppercase">
                Online • Main Server
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[0.85]">
              Progress <br />
              <span className="text-[#ccff00] underline decoration-[#ccff00]/20">Dashboard</span>
            </h1>

            <p className="text-white/50 text-lg max-w-xl font-light">
              Track your journey across FoxPassport. Level up your paths to unlock exclusive perks
              and venue access.
            </p>
          </div>

          {/* Total Mastery Card */}
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
                style={{ width: `${(totalXP / maxTotalXP) * 100}%` }}
              ></div>
            </div>

            <div className="text-xs text-right text-white/40 font-mono tracking-wider">
              {formatXP(totalXP)} / {formatXP(maxTotalXP)} XP
            </div>
          </div>
        </div>
      )}

      {/* Path Circular Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {mockPaths.map((path) => {
          return (
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
          );
        })}
      </div>

      {/* Badges Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ccff00] text-[32px]">award_star</span>
            Recent Drops <span className="text-[#ccff00]">&</span> Badges
          </h2>
          <button className="text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
            View Collection
            <span className="text-[16px] group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <BadgeGrid 
          badges={MOCK_BADGES.slice(0, 4)} 
          maxDisplay={4} 
          className="lg:grid-cols-4" 
          onBadgeClick={handleBadgeClick}
        />
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
            <button className="text-sm font-bold text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
              View All
              <span className="text-[16px] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <PassportGrid stamps={MOCK_PASSPORT_STAMPS} />
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

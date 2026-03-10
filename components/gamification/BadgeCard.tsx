'use client';

import React from 'react';
import { Badge, BadgeRarity } from '@/types/gamification';
import { BADGE_COLORS } from '@/types/gamification';

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
  locked?: boolean;
  className?: string;
}

export default function BadgeCard({ badge, onClick, locked = false, className = '' }: BadgeCardProps) {
  if (locked) {
    return (
      <div
        className={`glass-card rounded-[2rem] p-6 flex flex-col items-center justify-center opacity-40 border-dashed border-2 border-white/5 grayscale ${className}`}
      >
        <span className="material-symbols-outlined text-white/20 text-[32px] mb-2">lock</span>
        <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Locked</span>
      </div>
    );
  }

  const rarityClass = `badge-${badge.rarity.toLowerCase()}`;

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-[2rem] p-6 flex flex-col items-center text-center group cursor-pointer hover:bg-surface-highlight transition-all hover:scale-105 border border-white/5 hover:border-accent/20 ${className}`}
    >
      {/* Badge icon with glow effect */}
      <div className="h-16 w-16 mb-4 relative">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: badge.color }}
        ></div>
        <div
          className={`relative h-full w-full ${rarityClass} rounded-full border border-white/10 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500`}
        >
          <span className="material-symbols-outlined text-[32px] drop-shadow-lg text-white">
            {badge.icon}
          </span>
        </div>
      </div>

      {/* Badge name */}
      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-accent transition-colors">
        {badge.name}
      </h4>

      {/* Rarity label */}
      <span
        className="text-[10px] uppercase tracking-widest font-bold mb-2"
        style={{ color: BADGE_COLORS[badge.rarity] }}
      >
        {badge.rarity}
      </span>

      {/* Progress bar (if applicable) */}
      {badge.progress !== undefined && badge.maxProgress !== undefined && (
        <div className="w-full mt-2">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(badge.progress / badge.maxProgress) * 100}%`,
                backgroundColor: badge.color,
              }}
            ></div>
          </div>
          <div className="text-[9px] text-white/40 mt-1 font-mono">
            {badge.progress} / {badge.maxProgress}
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  maxDisplay?: number;
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
}

export function BadgeGrid({ badges, maxDisplay = 6, onBadgeClick, className = '' }: BadgeGridProps) {
  const displayedBadges = badges.slice(0, maxDisplay);
  const lockedCount = Math.max(0, maxDisplay - badges.length);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ${className}`}>
      {displayedBadges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} onClick={() => onBadgeClick?.(badge)} />
      ))}
      {Array.from({ length: lockedCount }).map((_, idx) => (
        <BadgeCard key={`locked-${idx}`} badge={{} as Badge} locked={true} />
      ))}
    </div>
  );
}

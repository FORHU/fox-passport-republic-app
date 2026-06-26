'use client';

import React from 'react';
import { PassportStamp } from '@/types/gamification';
import { formatXP } from '@/lib/gamification';

interface PassportStampCardProps {
  stamp: PassportStamp;
  onClick?: () => void;
  className?: string;
}

export default function PassportStampCard({ stamp, onClick, className = '' }: PassportStampCardProps) {
  const formattedDate = new Date(stamp.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-[2rem] overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 border border-white/5 hover:border-accent/30 ${className}`}
    >
      {/* Event Image */}
      {stamp.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={stamp.imageUrl}
            alt={stamp.eventTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

          {/* XP Badge */}
          <div className="absolute top-4 right-4 bg-accent text-black px-3 py-1 rounded-full text-xs font-bold shadow-neon">
            +{stamp.xpEarned} XP
          </div>
        </div>
      )}

      {/* Stamp Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {stamp.eventTitle}
        </h3>

        <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
          <span className="text-[16px]">📍</span>
          <span>{stamp.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
          <span className="text-[16px]">📅</span>
          <span>{formattedDate}</span>
        </div>

        {/* Badges Earned */}
        {stamp.badgesEarned && stamp.badgesEarned.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-bold">
              Badges Earned
            </p>
            <div className="flex gap-2 flex-wrap">
              {stamp.badgesEarned.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1 text-xs"
                >
                  <span className="text-[14px]">{badge.icon === 'palette' ? '🎨' : '⭐'}</span>
                  <span className="text-white font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stamp Verification */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
            Verified
          </span>
          <span className="text-green-500 text-[16px]">✓</span>
        </div>
      </div>
    </div>
  );
}

interface PassportGridProps {
  stamps: PassportStamp[];
  onStampClick?: (stamp: PassportStamp) => void;
  className?: string;
}

export function PassportGrid({ stamps, onStampClick, className = '' }: PassportGridProps) {
  if (stamps.length === 0) {
    return (
      <div className="glass-panel rounded-[3rem] p-16 text-center">
        <div className="text-6xl mb-4">📖</div>
        <h3 className="text-xl font-bold text-white mb-2">No stamps yet</h3>
        <p className="text-text-muted max-w-md mx-auto">
          Start attending events to collect passport stamps and track your journey!
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {stamps.map((stamp) => (
        <PassportStampCard key={stamp.id} stamp={stamp} onClick={() => onStampClick?.(stamp)} />
      ))}
    </div>
  );
}

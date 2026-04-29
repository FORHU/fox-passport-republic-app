'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/types/gamification';

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
  locked?: boolean;
  className?: string;
}

const getPathColor = (path: string) => {
  switch (path) {
    case 'user': return '#22c55e'; // Green
    case 'foxer': return '#f97316'; // Orange
    case 'host': return '#3b82f6'; // Blue
    case 'mayor': return '#ccff00'; // Neon
    default: return '#ffffff';
  }
};

export default function BadgeCard({ badge, onClick, locked = false, className = '' }: BadgeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, translateY: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative aspect-square w-full rounded-[2.5rem] p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${
        locked ? 'bg-white/2 border border-white/5 opacity-40 grayscale' : 'bg-emerald-950/40 border border-emerald-500/20'
      } ${className}`}
    >
      {/* Background Glow */}
      {!locked && (
        <div 
          className="absolute inset-0 opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
          style={{ background: `radial-gradient(circle at center, ${badge.color || '#ccff00'}, transparent)` }}
        />
      )}

      {/* Icon Circle */}
      <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-500 group-hover:rotate-12 ${
        locked ? 'bg-white/5' : 'bg-black/40 shadow-inner'
      }`}
      style={{ border: `1px solid ${locked ? 'rgba(255,255,255,0.1)' : badge.color + '40'}` }}>
        <span className={`material-symbols-outlined text-2xl sm:text-3xl ${locked ? 'text-white/20' : ''}`} style={{ color: !locked ? badge.color : undefined }}>
          {locked ? 'lock' : badge.icon}
        </span>
      </div>

      {/* Text Info */}
      <div className="relative z-10 text-center w-full px-2">
        <h4 className={`text-[9px] sm:text-[10px] font-bold mb-1 tracking-tight truncate ${locked ? 'text-white/20' : 'text-white'}`}>
          {badge.name || 'Unknown Badge'}
        </h4>
        <div className="space-y-1 sm:space-y-1.5">
          <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: !locked ? badge.color : 'rgba(255,255,255,0.1)' }}>
            {badge.rarity}
          </p>
          {badge.path && (
            <div 
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border transition-all ${locked ? 'bg-white/5 border-white/10 opacity-60' : ''}`}
              style={{ 
                backgroundColor: !locked ? `${getPathColor(badge.path)}15` : undefined,
                borderColor: !locked ? `${getPathColor(badge.path)}40` : undefined,
                boxShadow: !locked ? `0 0 10px ${getPathColor(badge.path)}20` : undefined
              }}
            >
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ backgroundColor: !locked ? getPathColor(badge.path) : 'rgba(255,255,255,0.2)' }}></span>
              <p className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white">
                {badge.path === 'user' ? 'Citizen' : badge.path}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  maxDisplay?: number;
  onBadgeClick?: (badge: Badge) => void;
  className?: string;
  lockedBadges?: string[];
}

export function BadgeGrid({ badges, maxDisplay = 6, onBadgeClick, className = '', lockedBadges = [] }: BadgeGridProps) {
  const displayedBadges = badges.slice(0, maxDisplay);
  const lockedCount = Math.max(0, maxDisplay - badges.length);

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 place-items-center ${className}`}>
      {displayedBadges.map((badge) => (
        <BadgeCard 
          key={badge.id} 
          badge={badge} 
          onClick={() => onBadgeClick?.(badge)} 
          locked={lockedBadges.includes(badge.id)}
        />
      ))}
      {Array.from({ length: lockedCount }).map((_, idx) => (
        <div key={`locked-container-${idx}`} className="w-full">
          <BadgeCard badge={{} as Badge} locked={true} />
        </div>
      ))}
    </div>
  );
}

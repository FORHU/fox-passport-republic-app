'use client';

import { motion } from 'motion/react';
import { Badge } from '@/features/gamification/types/gamification';

const RARITY_CONFIG: Record<string, { bg: string; border: string; glow: string; label: string }> = {
  common:   { bg: 'bg-white/5',       border: 'border-white/10',       glow: '#ffffff',  label: 'text-white/50' },
  uncommon: { bg: 'bg-green-950/40',  border: 'border-green-500/30',   glow: '#22c55e',  label: 'text-green-400' },
  rare:     { bg: 'bg-blue-950/40',   border: 'border-blue-500/30',    glow: '#3b82f6',  label: 'text-blue-400' },
  epic:     { bg: 'bg-purple-950/40', border: 'border-purple-500/30',  glow: '#a855f7',  label: 'text-purple-400' },
  legendary:{ bg: 'bg-amber-950/40',  border: 'border-amber-500/30',   glow: '#f59e0b',  label: 'text-amber-400' },
};

const PATH_CONFIG: Record<string, { color: string; label: string }> = {
  user:         { color: '#22c55e', label: 'Citizen' },
  gearFoxer:    { color: '#f97316', label: 'GearFoxer' },
  serviceFoxer: { color: '#f97316', label: 'ServiceFoxer' },
  eventFoxer:   { color: '#3b82f6', label: 'EventFoxer' },
  venueFoxer:   { color: '#ccff00', label: 'VenueFoxer' },
};

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
  locked?: boolean;
  className?: string;
}

export default function BadgeCard({ badge, onClick, locked = false, className = '' }: BadgeCardProps) {
  const rarity = (badge.rarity ?? 'common').toLowerCase();
  const cfg = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.common;
  const pathCfg = badge.path ? PATH_CONFIG[badge.path] : null;
  const iconColor = locked ? 'rgba(255,255,255,0.15)' : (badge.color || cfg.glow);

  return (
    <motion.div
      whileHover={{ scale: 1.04, translateY: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative w-full rounded-[2rem] p-5 flex flex-col items-center justify-between cursor-pointer overflow-hidden group border ${
        locked ? 'bg-white/2 border-white/5 opacity-40 grayscale' : `${cfg.bg} ${cfg.border}`
      } ${className}`}
      style={{ minHeight: '180px' }}
    >
      {/* Radial glow background */}
      {!locked && (
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow}80, transparent 70%)` }}
        />
      )}

      {/* Top bar accent */}
      {!locked && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-2/3 rounded-full opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.glow}, transparent)` }}
        />
      )}

      {/* Icon */}
      <div
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110"
        style={{
          background: locked ? 'rgba(255,255,255,0.04)' : `${cfg.glow}18`,
          border: `1px solid ${locked ? 'rgba(255,255,255,0.08)' : cfg.glow + '40'}`,
          boxShadow: locked ? 'none' : `0 0 20px ${cfg.glow}25`,
        }}
      >
        <span
          className="material-symbols-outlined text-3xl"
          style={{ color: iconColor }}
        >
          {locked ? 'lock' : badge.icon}
        </span>
      </div>

      {/* Name */}
      <div className="relative z-10 text-center w-full">
        <h4 className={`text-[11px] font-bold leading-tight mb-1.5 truncate px-1 ${locked ? 'text-white/20' : 'text-white'}`}>
          {badge.name || '???'}
        </h4>

        {/* Rarity */}
        <p className={`text-[9px] font-black uppercase tracking-[0.25em] mb-2 ${locked ? 'text-white/10' : cfg.label}`}>
          {badge.rarity ?? 'Common'}
        </p>

        {/* Path pill */}
        {pathCfg && (
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mx-auto"
            style={{
              background: locked ? 'rgba(255,255,255,0.04)' : `${pathCfg.color}12`,
              border: `1px solid ${locked ? 'rgba(255,255,255,0.08)' : pathCfg.color + '35'}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: locked ? 'rgba(255,255,255,0.2)' : pathCfg.color }}
            />
            <span
              className="text-[7px] font-black uppercase tracking-[0.2em]"
              style={{ color: locked ? 'rgba(255,255,255,0.2)' : pathCfg.color }}
            >
              {pathCfg.label}
            </span>
          </div>
        )}
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
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 ${className}`}>
      {displayedBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          onClick={() => onBadgeClick?.(badge)}
          locked={lockedBadges.includes(badge.id)}
        />
      ))}
      {Array.from({ length: lockedCount }).map((_, idx) => (
        <BadgeCard key={`locked-${idx}`} badge={{} as Badge} locked />
      ))}
    </div>
  );
}

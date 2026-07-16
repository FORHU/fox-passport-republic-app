'use client';

import React from 'react';
import { PassportStamp } from '@/features/gamification/types/gamification';

type StampMeta = { icon: string; color: string; label: string; shape: 'circle' | 'rect' | 'hex' };

function getStampMeta(title: string): StampMeta {
  const t = title.toLowerCase();
  if (t.includes('wedding'))
    return { icon: '💍', color: '#ec4899', label: 'CELEBRATION', shape: 'circle' };
  if (t.includes('birthday') || t.includes('surprise') || t.includes('party'))
    return { icon: '🎂', color: '#f59e0b', label: 'FESTIVITY', shape: 'rect' };
  if (t.includes('corporate') || t.includes('summit') || t.includes('demo') || t.includes('startup') || t.includes('acme'))
    return { icon: '🏢', color: '#3b82f6', label: 'BUSINESS', shape: 'rect' };
  if (t.includes('social') || t.includes('rooftop') || t.includes('festival') || t.includes('music'))
    return { icon: '🎊', color: '#10b981', label: 'SOCIAL', shape: 'circle' };
  if (t.includes('concert') || t.includes('band') || t.includes('live'))
    return { icon: '🎵', color: '#8b5cf6', label: 'MUSIC', shape: 'circle' };
  return { icon: '⭐', color: '#ccff00', label: 'EVENT', shape: 'rect' };
}

// Extract short city name
function shortLocation(loc: string) {
  return loc.split(',')[0].toUpperCase();
}

// Extract year from date
function stampYear(date: Date) {
  return new Date(date).getFullYear();
}

// Deterministic rotation — varies per stamp so the grid looks natural
const ROTATIONS = [-3, 2, -1.5, 3, -2, 1, -3.5, 2.5, -1];

interface PassportStampCardProps {
  stamp: PassportStamp;
  onClick?: () => void;
  index?: number;
}

function CircleStamp({ stamp, meta, rotate }: { stamp: PassportStamp; meta: StampMeta; rotate: number }) {
  const c = meta.color;
  const date = new Date(stamp.eventDate);
  const day = date.toLocaleDateString('en-US', { day: '2-digit' });
  const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yr  = date.getFullYear();

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className="relative flex items-center justify-center"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {/* Outer ring */}
        <div
          className="h-44 w-44 rounded-full flex items-center justify-center"
          style={{
            border: `3px solid ${c}`,
            opacity: 0.9,
            boxShadow: `0 0 0 6px transparent, 0 0 0 8px ${c}22`,
          }}
        >
          {/* Inner ring */}
          <div
            className="h-36 w-36 rounded-full flex flex-col items-center justify-center gap-1"
            style={{ border: `2px solid ${c}` }}
          >
            {/* Top arc label */}
            <span
              className="text-[9px] font-black uppercase tracking-[0.3em]"
              style={{ color: c }}
            >
              {meta.label}
            </span>

            {/* Icon */}
            <span className="text-3xl leading-none">{meta.icon}</span>

            {/* City */}
            <span
              className="text-[8px] font-black tracking-[0.2em]"
              style={{ color: c }}
            >
              {shortLocation(stamp.location)}
            </span>

            {/* Date line */}
            <div
              className="flex items-center gap-1 text-[8px] font-bold px-3 py-0.5 rounded-full mt-0.5"
              style={{ border: `1px solid ${c}44`, color: `${c}99` }}
            >
              {day} · {mon} · {yr}
            </div>
          </div>
        </div>

        {/* XP badge */}
        <div
          className="absolute -top-1 -right-1 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black"
          style={{ backgroundColor: c }}
        >
          +{stamp.xpEarned}XP
        </div>
      </div>
    </div>
  );
}

function RectStamp({ stamp, meta, rotate }: { stamp: PassportStamp; meta: StampMeta; rotate: number }) {
  const c = meta.color;
  const date = new Date(stamp.eventDate);
  const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const yr  = date.getFullYear();

  // Truncate long titles
  const title = stamp.eventTitle.length > 22
    ? stamp.eventTitle.slice(0, 20).toUpperCase() + '…'
    : stamp.eventTitle.toUpperCase();

  return (
    <div className="flex items-center justify-center p-6">
      <div
        className="relative"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {/* Perforated outer edge using dashed border */}
        <div
          className="px-5 py-4 rounded-2xl"
          style={{
            border: `3px dashed ${c}`,
            opacity: 0.92,
          }}
        >
          {/* Inner solid border */}
          <div
            className="px-4 py-3 rounded-xl flex flex-col items-center gap-1.5 min-w-[140px]"
            style={{ border: `2px solid ${c}` }}
          >
            {/* Top label */}
            <span
              className="text-[8px] font-black uppercase tracking-[0.25em]"
              style={{ color: c }}
            >
              {meta.label}
            </span>

            {/* Divider stars */}
            <span className="text-[8px]" style={{ color: `${c}66` }}>★ ★ ★</span>

            {/* Icon */}
            <span className="text-2xl leading-none">{meta.icon}</span>

            {/* Event title */}
            <span
              className="text-[9px] font-black tracking-[0.15em] text-center leading-tight max-w-[120px]"
              style={{ color: c }}
            >
              {title}
            </span>

            {/* Divider */}
            <div className="w-full h-px" style={{ backgroundColor: `${c}44` }} />

            {/* Location + Date */}
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-[7px] font-bold tracking-wider" style={{ color: `${c}88` }}>
                {shortLocation(stamp.location)}
              </span>
              <span className="text-[7px] font-bold tracking-wider" style={{ color: `${c}88` }}>
                {mon} {yr}
              </span>
            </div>

            {/* Verified */}
            <span className="text-[7px] font-black tracking-[0.3em] mt-0.5" style={{ color: `${c}55` }}>
              ✓ VERIFIED
            </span>
          </div>
        </div>

        {/* XP badge */}
        <div
          className="absolute -top-2 -right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black"
          style={{ backgroundColor: c }}
        >
          +{stamp.xpEarned}XP
        </div>
      </div>
    </div>
  );
}

export default function PassportStampCard({ stamp, onClick, index = 0 }: PassportStampCardProps) {
  const meta = getStampMeta(stamp.eventTitle);
  const rotate = ROTATIONS[index % ROTATIONS.length];

  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:scale-105 transition-transform duration-300 flex items-center justify-center"
    >
      {meta.shape === 'circle'
        ? <CircleStamp stamp={stamp} meta={meta} rotate={rotate} />
        : <RectStamp  stamp={stamp} meta={meta} rotate={rotate} />
      }
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
      <div className="flex flex-col items-center py-24 opacity-20 text-center">
        <span className="text-7xl mb-4">📖</span>
        <h3 className="text-xl font-bold text-white mb-2">No stamps yet</h3>
        <p className="text-sm text-white/60 max-w-xs">
          Attend or organize events to start collecting passport stamps.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ${className}`}>
      {stamps.map((stamp, i) => (
        <PassportStampCard
          key={stamp.id}
          stamp={stamp}
          index={i}
          onClick={() => onStampClick?.(stamp)}
        />
      ))}
    </div>
  );
}

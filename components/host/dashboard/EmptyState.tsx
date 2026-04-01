'use client';

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'events' | 'venues' | 'inventories' | 'services';
  href: string;
}

export function EmptyState({ type, href }: EmptyStateProps) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const singleLabel = type.endsWith('ies') 
    ? type.slice(0, -3) + 'y' 
    : type.endsWith('s') 
      ? type.slice(0, -1) 
      : type;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#0f111a]/40 border border-white/5 rounded-[2rem] text-center w-full">
      <p className="text-white/40 mb-6 font-display">No available {type}</p>
      <Link
        href={href}
        className="flex flex-col items-center gap-2 group transition-all"
      >
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:border-[#ccff00] group-hover:text-[#ccff00] group-hover:scale-110 transition-all duration-300 bg-white/5">
          <span className="material-symbols-outlined text-[24px]">add</span>
        </div>
        <span className="text-[10px] font-bold text-white/30 group-hover:text-[#ccff00] transition-all uppercase tracking-[0.2em]">
          Add {singleLabel}
        </span>
      </Link>
    </div>
  );
}

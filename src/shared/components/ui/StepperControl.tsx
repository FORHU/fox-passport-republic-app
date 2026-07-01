'use client';

import React from 'react';

interface StepperControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  label?: string;
  icon?: string;
}

export function StepperControl({
  value,
  onChange,
  min = 1,
  step = 1,
  label,
  icon,
}: StepperControlProps) {
  return (
    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="h-12 w-12 rounded-full bg-surface-highlight flex items-center justify-center text-white">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        {label && <p className="font-bold text-white">{label}</p>}
      </div>
      <div className="flex items-center gap-4 bg-surface rounded-full p-1 border border-white/10">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-10 w-10 rounded-full bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <span className="text-xl font-bold font-display w-8 text-center text-white">{value}</span>
        <button
          onClick={() => onChange(value + step)}
          className="h-10 w-10 rounded-full bg-white text-black hover:bg-accent flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </div>
  );
}

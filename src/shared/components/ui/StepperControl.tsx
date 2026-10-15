"use client";

import React, { useState, useEffect } from "react";

interface StepperControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  icon?: string;
}

export function StepperControl({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  label,
  icon,
}: StepperControlProps) {
  // Keep a local string so the user can type freely; we only commit a clamped
  // number to the parent on blur or Enter.
  const [draft, setDraft] = useState(String(value));

  // Sync draft when the parent resets value externally (e.g. form reset).
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      // Revert to last valid value
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(
      max !== undefined ? max : Infinity,
      Math.max(min, parsed),
    );
    setDraft(String(clamped));
    onChange(clamped);
  };

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
      <div className="flex items-center gap-3 bg-surface rounded-full p-1 border border-white/10">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-10 w-10 rounded-full bg-surface-highlight text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Decrease"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>

        {/* Editable number — clamps on blur/Enter, caps at max */}
        <input
          type="number"
          inputMode="numeric"
          value={draft}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="w-14 text-xl font-bold font-display text-center text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-accent rounded-lg py-1
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={label ?? "Value"}
        />

        <button
          onClick={() =>
            onChange(max !== undefined ? Math.min(max, value + step) : value + step)
          }
          disabled={max !== undefined && value >= max}
          className="h-10 w-10 rounded-full bg-white text-black hover:bg-accent flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label="Increase"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </div>
  );
}

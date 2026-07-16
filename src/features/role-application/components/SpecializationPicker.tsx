"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SpecializationPickerProps {
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  accentColor: string;
  max?: number;
}

export default function SpecializationPicker({
  options,
  value,
  onChange,
  accentColor,
  max = 3,
}: SpecializationPickerProps) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (value.length < max) {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} style={{ color: accentColor }} />
          Specializations
          <span className="text-white/30 normal-case font-normal tracking-normal text-xs">(optional, pick up to {max})</span>
        </label>
        <p className="text-xs text-white/40 mt-1">
          These declared specializations help clients find you. You can earn more through your track record.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          const disabled = !selected && value.length >= max;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={
                selected
                  ? { backgroundColor: accentColor + "22", borderColor: accentColor, color: accentColor }
                  : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.12)", color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)" }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

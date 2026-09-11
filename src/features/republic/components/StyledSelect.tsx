"use client";

import { useEffect, useRef, useState } from "react";

export interface StyledSelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface StyledSelectProps {
  value: string;
  options: StyledSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

// A themed stand-in for `<select>`. Native selects can't be styled once
// open — the option list always renders in the OS/browser's own chrome
// regardless of CSS, which clashes hard against a dark custom UI. This
// renders both the closed trigger and the open menu itself, so every pixel
// stays on-theme, and positions the chevron with real padding instead of
// sitting flush against the edge the way a native select's arrow does.
export function StyledSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl pl-3 pr-2.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-lime-400/60 transition-all"
      >
        {selected?.icon && (
          <span className="material-symbols-outlined text-lime-400 text-[18px] shrink-0">
            {selected.icon}
          </span>
        )}
        <span
          className={`flex-1 text-left truncate ${selected ? "" : "text-zinc-500 font-normal"}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-zinc-500 text-[18px] shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-56 overflow-y-auto bg-zinc-900 border border-zinc-700/60 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-left transition-all ${
                  isSelected
                    ? "bg-lime-400/15 text-lime-400"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {opt.icon && (
                  <span className="material-symbols-outlined text-[16px] shrink-0">
                    {opt.icon}
                  </span>
                )}
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

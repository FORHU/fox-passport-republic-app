"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocationSearch } from "@/features/landing/hooks/useLocationSearch";
import { MAJOR_CITIES } from "@/shared/data/majorCities";

interface LocationFieldProps {
  value: string;
  error?: string;
  onChange: (val: string) => void;
  onClearError: () => void;
}

export function LocationField({
  value,
  error,
  onChange,
  onClearError,
}: LocationFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cities = useLocationSearch(value);

  const close = useCallback(() => {
    setOpen(false);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: Math.max(16, rect.left),
        width: Math.max(180, rect.width),
      });
    }
    setShowSuggestions(false);
    setOpen((o) => !o);
  };

  const locations = ["All Locations", ...MAJOR_CITIES];

  return (
    <div
      className="flex-1 min-w-0 md:min-w-[110px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative"
      ref={ref}
    >
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">
        LOCATION
      </span>
      <div className="flex items-center justify-between w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onClearError();
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search..."
          className={`bg-transparent border-none text-white placeholder:text-white/40 text-[9px] sm:text-xs md:text-sm font-semibold outline-none focus:ring-0 w-full min-w-0 text-ellipsis p-0 ${error ? "text-red-400" : ""}`}
        />
        <button
          type="button"
          onClick={toggle}
          className="bg-transparent border-none outline-none cursor-pointer p-0 shrink-0 text-white/40 hover:text-white transition-colors"
        >
          <span
            className={`hidden sm:inline-block material-symbols-outlined text-[16px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            expand_more
          </span>
        </button>
      </div>
      {error && (
        <span className="block text-[7px] md:text-[9px] font-bold text-red-400 mt-0.5 ml-1 animate-pulse truncate">
          {error}
        </span>
      )}

      {showSuggestions && cities.length > 0 && (
        <ul className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-[#11121a] border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-60 overflow-y-auto p-0 list-none m-0">
          {cities.map((loc) => (
            <li
              key={loc}
              className="px-4 py-3 text-sm text-white hover:bg-[#ccff00] hover:text-black cursor-pointer font-bold transition-colors list-none"
              onClick={() => {
                onChange(loc);
                onClearError();
                setShowSuggestions(false);
              }}
            >
              {loc}
            </li>
          ))}
        </ul>
      )}

      {open &&
        !showSuggestions &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#11121a] max-h-64 overflow-y-auto">
              {locations.map((loc) => {
                const val = loc === "All Locations" ? "" : loc;
                const isSelected = value === val;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      onChange(val);
                      onClearError();
                      close();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ccff00]/15 text-[#ccff00]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

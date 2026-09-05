"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const CATEGORIES = ["Wedding", "Corporate", "Birthday", "Social", "Other"];

interface CategoryFieldProps {
  value: string;
  error?: string;
  onChange: (val: string) => void;
  onClearError: () => void;
}

export function CategoryField({
  value,
  error,
  onChange,
  onClearError,
}: CategoryFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(160, rect.width),
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div
      className="flex-1 min-w-0 md:min-w-[100px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative"
      ref={ref}
    >
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">
        CATEGORY
      </span>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center justify-between w-full bg-transparent border-none text-[9px] sm:text-xs md:text-sm font-semibold outline-none text-left cursor-pointer ${
          value ? "text-white" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        <span className="capitalize truncate">{value || "Select"}</span>
        <span
          className={`hidden sm:inline-block material-symbols-outlined text-[16px] text-white/40 shrink-0 transition-transform duration-200 ml-1 ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {error && (
        <span className="block text-[7px] md:text-[9px] font-bold text-red-400 mt-0.5 ml-1 animate-pulse truncate">
          {error}
        </span>
      )}

      {open &&
        createPortal(
          <div
            className="fixed z-[101] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-[#11121a]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    onClearError();
                    close();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm capitalize transition-all cursor-pointer ${
                    value === cat
                      ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

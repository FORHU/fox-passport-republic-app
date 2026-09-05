"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CompactCalendar } from "./CompactCalendar";

interface DateFieldProps {
  label: string;
  value: string;
  error?: string;
  onSelect: (d: string) => void;
  onClearError: () => void;
}

export function DateField({
  label,
  value,
  error,
  onSelect,
  onClearError,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

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
      const safeLeft = Math.min(rect.left, window.innerWidth - 268);
      setPos({ top: rect.bottom + 6, left: Math.max(8, safeLeft) });
    }
    setOpen((o) => !o);
  };

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="flex-1 min-w-0 md:min-w-[100px] px-1 py-0.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-left cursor-pointer group/item hover:bg-white/10 rounded-2xl transition-colors relative"
      ref={ref}
    >
      <span className="block text-[7px] md:text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-0.5 ml-1">
        {label}
      </span>
      <button
        type="button"
        onClick={toggle}
        className={`bg-transparent border-none text-[9px] sm:text-xs md:text-sm font-semibold w-full outline-none text-left cursor-pointer truncate ${
          value ? "text-white" : "text-white/40"
        } ${error ? "text-red-400" : ""}`}
      >
        {display || "Select"}
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
            style={{ top: pos.top, left: pos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CompactCalendar
              value={value}
              onSelect={(d) => {
                onSelect(d);
                onClearError();
                close();
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

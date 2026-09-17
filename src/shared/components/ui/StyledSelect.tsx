"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

export interface StyledSelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface StyledSelectProps {
  value: string;
  /** Plain strings are used as both value and label. */
  options: (StyledSelectOption | string)[];
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  panelClassName?: string;
}

// A themed stand-in for `<select>`. Native selects can't be styled once
// open — the option list always renders in the OS/browser's own chrome
// regardless of CSS, which clashes hard against a dark custom UI. This
// renders both the closed trigger and the open menu itself, so every pixel
// stays on-theme.
export function StyledSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  id,
  name,
  disabled = false,
  className,
  panelClassName,
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const normalized: StyledSelectOption[] = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt,
      ),
    [options],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = normalized.findIndex((o) => o.value === value);
      setHighlighted(idx >= 0 ? idx : 0);
    }
  }, [open, normalized, value]);

  const selected = normalized.find((opt) => opt.value === value);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, normalized.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = normalized[highlighted];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={ref} className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white text-left cursor-pointer transition-colors",
          "focus:outline-none focus:border-accent/50",
          disabled && "opacity-40 cursor-not-allowed",
          className,
        )}
      >
        {selected?.icon && (
          <span className="material-symbols-outlined text-accent text-[18px] shrink-0">
            {selected.icon}
          </span>
        )}
        <span
          className={cn(
            "flex-1 truncate",
            !selected && "text-white/30 font-normal",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <span
          className={cn(
            "material-symbols-outlined text-white/30 text-[18px] shrink-0 transition-transform",
            open && "rotate-180",
          )}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto bg-[#12141c] border border-white/10 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
            panelClassName,
          )}
        >
          {normalized.map((opt, idx) => {
            const isSelected = value === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setHighlighted(idx)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  opt.disabled && "opacity-40 cursor-not-allowed",
                  isSelected
                    ? "bg-accent/10 text-accent"
                    : idx === highlighted
                      ? "bg-white/10 text-white"
                      : "text-white/70",
                )}
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

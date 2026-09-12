"use client";

import { useEffect, useRef, useState } from "react";

export type FeedSortMode = "recent" | "top";

interface FeedSortMenuProps {
  mode: FeedSortMode;
  onChange: (mode: FeedSortMode) => void;
}

const OPTIONS: Array<{
  id: FeedSortMode;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: "recent",
    label: "Recent",
    icon: "schedule",
    description: "Newest posts first",
  },
  {
    id: "top",
    label: "Top Posts",
    icon: "hotel_class",
    description: "Most liked & discussed",
  },
];

// Same click-outside dropdown pattern as RepublicTabs' "ALL FEEDS" filter —
// a compact "Posts ▾" trigger instead of a permanent two-button toggle
// eating space above the feed.
export function FeedSortMenu({ mode, onChange }: FeedSortMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const active = OPTIONS.find((o) => o.id === mode) ?? OPTIONS[0];

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-800/60 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[15px] text-lime-400">
          filter_list
        </span>
        {active.label}
        <span
          className={`material-symbols-outlined text-[13px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 z-30 space-y-1 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-1.5 shadow-2xl animate-in fade-in zoom-in-95">
          {OPTIONS.map((opt) => {
            const isActive = opt.id === mode;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isActive
                    ? "bg-zinc-800/90 text-white border border-lime-400/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${isActive ? "text-lime-400" : "text-zinc-500"}`}
                >
                  {opt.icon}
                </span>
                <span className="flex flex-col">
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-zinc-500">
                    {opt.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

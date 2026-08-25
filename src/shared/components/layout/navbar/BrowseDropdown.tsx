"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const BROWSE_ITEMS = [
  {
    label: "Event Foxers",
    icon: "celebration",
    href: "/search?type=event_template",
  },
  {
    label: "Talent & Services",
    icon: "theater_comedy",
    href: "/search?type=service",
  },
  { label: "Gear & Rentals", icon: "speaker", href: "/search?type=asset" },
  { label: "Venues", icon: "location_city", href: "/search?type=venue" },
] as const;

export function BrowseDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5"
      >
        Explore
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <p className="px-4 pt-3 pb-1.5 text-[9px] font-black uppercase tracking-widest text-white/30">
            Browse by type
          </p>
          {BROWSE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ccff00]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseDropdown;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import MapboxLocationPicker from "./MapboxLocationPicker";
import DateRangePicker from "@/shared/components/ui/DateRangePicker";

const CATEGORIES = ["wedding", "corporate", "birthday", "social", "other"];

function CategoryDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = value
    ? CATEGORIES.find((c) => c === value)
    : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00]/50 transition-all"
      >
        <span className={selected ? "capitalize text-white" : "text-white/30"}>
          {selected || "All categories"}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] text-white/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed z-[101] w-[var(--cat-w)] animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: "var(--cat-top)",
              left: "var(--cat-left)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div className="glass-card rounded-xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={() => onChange("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                  !value
                    ? "bg-[#ccff00]/15 text-[#ccff00] font-bold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                All categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onChange(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${
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
          document.body
        )}

      <DropdownPositioner triggerRef={ref} open={open} cssVar="cat" />
    </div>
  );
}

function DropdownPositioner({
  triggerRef,
  open,
  cssVar,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  cssVar: string;
}) {
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const el = document.documentElement;
    el.style.setProperty(`--${cssVar}-top`, `${rect.bottom + 4}px`);
    el.style.setProperty(`--${cssVar}-left`, `${rect.left}px`);
    el.style.setProperty(`--${cssVar}-w`, `${rect.width}px`);
  }, [open, triggerRef, cssVar]);
  return null;
}

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsStr = searchParams?.toString() || "";

  const [category, setCategory] = useState(() => searchParams?.get("category") || "");
  const [city, setCity] = useState(() => searchParams?.get("city") || "");
  const [label, setLabel] = useState(() => searchParams?.get("label") || "");
  const [lat, setLat] = useState<number | undefined>(() =>
    searchParams?.get("lat") ? Number(searchParams.get("lat")) : undefined
  );
  const [lng, setLng] = useState<number | undefined>(() =>
    searchParams?.get("lng") ? Number(searchParams.get("lng")) : undefined
  );
  const [maxPrice, setMaxPrice] = useState(() => searchParams?.get("maxPrice") || "");
  const [startDate, setStartDate] = useState(() => searchParams?.get("startDate") || "");
  const [endDate, setEndDate] = useState(() => searchParams?.get("endDate") || "");

  const [prevParamsStr, setPrevParamsStr] = useState(searchParamsStr);

  if (searchParamsStr !== prevParamsStr) {
    setPrevParamsStr(searchParamsStr);
    setCategory(searchParams?.get("category") || "");
    setCity(searchParams?.get("city") || "");
    setLabel(searchParams?.get("label") || "");
    setLat(searchParams?.get("lat") ? Number(searchParams.get("lat")) : undefined);
    setLng(searchParams?.get("lng") ? Number(searchParams.get("lng")) : undefined);
    setMaxPrice(searchParams?.get("maxPrice") || "");
    setStartDate(searchParams?.get("startDate") || "");
    setEndDate(searchParams?.get("endDate") || "");
  }

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50";

  return (
    <div className="bg-[#11121a] border border-white/10 rounded-2xl p-6 space-y-6 h-fit">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
        <h3 className="text-lg font-display font-bold tracking-tight text-white">Filters</h3>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Category Vibe</label>
        <CategoryDropdown
          value={category}
          onChange={(val) => {
            setCategory(val);
            updateParams({ category: val });
          }}
        />
      </div>

      {/* City / Area */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">City / Area</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onBlur={(e) => updateParams({ city: e.target.value, label: e.target.value || label })}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ city: (e.target as HTMLInputElement).value })}
          placeholder="e.g. Baguio"
          className={inputClass}
        />
      </div>

      {/* Mapbox Epicenter */}
      <MapboxLocationPicker
        label="Epicenter Location"
        value={label}
        lat={lat}
        lng={lng}
        onChange={({ label: l, lat: la, lng: ln }) => {
          setLabel(l);
          setLat(la);
          setLng(ln);
          updateParams({
            label: l,
            lat: la?.toString(),
            lng: ln?.toString(),
            city: l.split(",")[0] || city,
          });
        }}
      />

      {/* Max Price */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
          Max Price: <span className="text-[#ccff00]">₱{maxPrice || "Any"}</span>
        </label>
        <input
          type="range"
          min={0}
          max={500000}
          step={1000}
          value={maxPrice || 0}
          onChange={(e) => setMaxPrice(e.target.value)}
          onMouseUp={(e) => updateParams({ maxPrice: (e.target as HTMLInputElement).value === "0" ? "" : (e.target as HTMLInputElement).value })}
          onTouchEnd={(e) => updateParams({ maxPrice: (e.target as HTMLInputElement).value === "0" ? "" : (e.target as HTMLInputElement).value })}
          className="w-full accent-[#ccff00]"
        />
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Date Range</label>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={(d) => {
            setStartDate(d);
            updateParams({ startDate: d });
          }}
          onEndChange={(d) => {
            setEndDate(d);
            updateParams({ endDate: d });
          }}
          startLabel="Start Date"
          endLabel="End Date"
          showSummary={false}
          stacked
        />
      </div>

      <button
        onClick={() => {
          setCategory("");
          setCity("");
          setLabel("");
          setLat(undefined);
          setLng(undefined);
          setMaxPrice("");
          setStartDate("");
          setEndDate("");
          updateParams({
            category: "",
            city: "",
            label: "",
            lat: undefined,
            lng: undefined,
            maxPrice: "",
            startDate: "",
            endDate: "",
          });
        }}
        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
}

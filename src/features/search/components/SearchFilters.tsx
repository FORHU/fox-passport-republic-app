"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import MapboxLocationPicker from "./MapboxLocationPicker";
import { CascadingLocationFields } from "@/shared/components/ui/CascadingLocationFields";
import { Money } from "@/shared/components/ui/Money";

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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = value ? CATEGORIES.find((c) => c === value) : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all"
      >
        <span className={selected ? "capitalize text-white" : "text-white/30"}>
          {selected || "All categories"}
        </span>
        <span
          className={`material-symbols-outlined text-lg text-white/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-101 w-(--cat-w) animate-in fade-in zoom-in-95 duration-150"
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
                    ? "bg-accent/15 text-accent font-bold"
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
                      ? "bg-accent/15 text-accent font-bold"
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

interface SearchFiltersProps {
  onClose?: () => void;
}

export default function SearchFilters({ onClose }: SearchFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsStr = searchParams?.toString() || "";

  const [category, setCategory] = useState(
    () => searchParams?.get("category") || "",
  );
  const [country, setCountry] = useState(
    () => searchParams?.get("country") || "",
  );
  const [city, setCity] = useState(() => searchParams?.get("city") || "");
  const [label, setLabel] = useState(() => searchParams?.get("label") || "");
  const [lat, setLat] = useState<number | undefined>(() =>
    searchParams?.get("lat") ? Number(searchParams.get("lat")) : undefined,
  );
  const [lng, setLng] = useState<number | undefined>(() =>
    searchParams?.get("lng") ? Number(searchParams.get("lng")) : undefined,
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams?.get("maxPrice") || "",
  );

  const [prevParamsStr, setPrevParamsStr] = useState(searchParamsStr);

  if (searchParamsStr !== prevParamsStr) {
    setPrevParamsStr(searchParamsStr);
    setCategory(searchParams?.get("category") || "");
    setCountry(searchParams?.get("country") || "");
    setCity(searchParams?.get("city") || "");
    setLabel(searchParams?.get("label") || "");
    setLat(
      searchParams?.get("lat") ? Number(searchParams.get("lat")) : undefined,
    );
    setLng(
      searchParams?.get("lng") ? Number(searchParams.get("lng")) : undefined,
    );
    setMaxPrice(searchParams?.get("maxPrice") || "");
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
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const commitMaxPrice = (raw: string) => {
    const clamped =
      raw === "" ? "" : String(Math.min(500000, Math.max(0, Number(raw))));
    setMaxPrice(clamped === "0" ? "" : clamped);
    updateParams({ maxPrice: clamped === "0" ? "" : clamped });
  };

  // Debounce while typing so filtering updates live without needing Enter/blur
  const maxPriceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onMaxPriceInput = (raw: string) => {
    setMaxPrice(raw);
    if (maxPriceDebounceRef.current) clearTimeout(maxPriceDebounceRef.current);
    maxPriceDebounceRef.current = setTimeout(() => commitMaxPrice(raw), 400);
  };

  const activeFiltersCount = [category, country, city, label, maxPrice].filter(
    Boolean,
  ).length;

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50";

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-6 space-y-6 h-fit">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <h3 className="text-lg font-display font-bold tracking-tight text-white">
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-black">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
          Category Vibe
        </label>
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
        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
          City / Area
        </label>
        {/* Country, then City — locked until a country is picked. */}
        <CascadingLocationFields
          value={{ country, state: "", city }}
          withState={false}
          className="grid grid-cols-1 gap-2"
          onChange={(next) => {
            if (next.country !== country) {
              setCountry(next.country);
              setCity(next.city);
              updateParams({
                country: next.country,
                city: next.city,
                label: next.city,
              });
              return;
            }
            setCity(next.city);
            updateParams({ city: next.city, label: next.city || label });
          }}
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
          Max Price:{" "}
          <span className="text-accent">
            {maxPrice ? <Money amount={maxPrice} /> : "Any"}
          </span>
        </label>
        <input
          type="number"
          min={0}
          max={500000}
          step={1000}
          value={maxPrice}
          placeholder="Any"
          onChange={(e) => onMaxPriceInput(e.target.value)}
          onBlur={(e) => {
            if (maxPriceDebounceRef.current)
              clearTimeout(maxPriceDebounceRef.current);
            commitMaxPrice(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (maxPriceDebounceRef.current)
                clearTimeout(maxPriceDebounceRef.current);
              commitMaxPrice((e.target as HTMLInputElement).value);
            }
          }}
          className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <input
          type="range"
          min={0}
          max={500000}
          step={1000}
          value={maxPrice || 0}
          onChange={(e) => setMaxPrice(e.target.value)}
          onMouseUp={(e) =>
            commitMaxPrice((e.target as HTMLInputElement).value)
          }
          onTouchEnd={(e) =>
            commitMaxPrice((e.target as HTMLInputElement).value)
          }
          onKeyUp={(e) => commitMaxPrice((e.target as HTMLInputElement).value)}
          className="w-full accent-accent"
        />
      </div>

      <div className="space-y-2 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-accent text-black font-bold text-sm hover:bg-accent-hover transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2"
          >
            <span>Show Results</span>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-black/20 text-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setCategory("");
            setCountry("");
            setCity("");
            setLabel("");
            setLat(undefined);
            setLng(undefined);
            setMaxPrice("");
            updateParams({
              category: "",
              country: "",
              city: "",
              label: "",
              lat: undefined,
              lng: undefined,
              maxPrice: "",
            });
          }}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

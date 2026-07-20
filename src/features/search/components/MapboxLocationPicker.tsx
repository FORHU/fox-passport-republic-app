"use client";

import { useState, useRef, useEffect } from "react";
import { config } from "@/shared/lib/config";

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
}

interface MapboxLocationPickerProps {
  label?: string;
  value: string;
  lat?: number;
  lng?: number;
  onChange: (payload: { label: string; lat?: number; lng?: number }) => void;
}

export default function MapboxLocationPicker({
  label = "Epicenter",
  value,
  lat,
  lng,
  onChange,
}: MapboxLocationPickerProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!config.mapboxToken) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${config.mapboxToken}&types=place,locality,neighborhood,address&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions((data.features as MapboxFeature[]) || []);
          setShowDropdown(true);
        }
      } catch (e) {
        console.warn("Mapbox geocode error:", e);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px]">
          location_on
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search epicenter..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/50"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
        )}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#11121a] border border-white/10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 text-sm text-white hover:bg-[#ccff00] hover:text-black cursor-pointer font-bold transition-colors"
                onClick={() => {
                  onChange({ label: s.place_name, lat: s.center[1], lng: s.center[0] });
                  setQuery(s.place_name);
                  setShowDropdown(false);
                }}
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {lat != null && lng != null && (
        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
          <span>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}

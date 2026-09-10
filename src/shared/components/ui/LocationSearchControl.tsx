"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X, Loader2, Globe2, MapPin } from "lucide-react";
import { getEffectiveMapboxToken } from "@/shared/lib/mapbox";

export interface LocationSearchResult {
  name: string;
  placeName: string;
  center: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number]; // [west, south, east, north]
  placeType: "country" | "place";
}

interface LocationSearchControlProps {
  onSelect: (result: LocationSearchResult) => void;
  /** Called when the picked location is cleared back to an empty search —
   * lets a parent drop any "results scoped to this place" filter it applied. */
  onClear?: () => void;
  className?: string;
  placeholder?: string;
}

// Jumps the map to a country or city the foxer picks, rather than only ever
// following their detected location — e.g. scouting venues somewhere they
// haven't traveled to yet. Kept to `types=country,place` so results stay
// predictable (typing "Ja" means "Japan"/"Jakarta", not some unrelated
// street or POI).
export function LocationSearchControl({
  onSelect,
  onClear,
  className = "",
  placeholder = "Search a country or city...",
}: LocationSearchControlProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const token = getEffectiveMapboxToken();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed || !token) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmed,
        )}.json?types=country,place&limit=8&access_token=${token}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Geocoding request failed");
        const data = await res.json();
        const features = Array.isArray(data.features) ? data.features : [];
        setResults(
          features.map((f: any) => ({
            name: f.text,
            placeName: f.place_name,
            center: f.center as [number, number],
            bbox: f.bbox as [number, number, number, number] | undefined,
            placeType: f.place_type?.includes("country")
              ? "country"
              : ("place" as const),
          })),
        );
        setIsOpen(true);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.warn("Location search failed:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, token]);

  const handleSelect = (result: LocationSearchResult) => {
    onSelect(result);
    setQuery(result.name);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onClear?.();
  };

  if (!token) return null;

  return (
    <div ref={containerRef} className={`relative w-64 max-w-[80vw] ${className}`}>
      <div className="relative">
        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#0b0d14]/95 backdrop-blur-xl border border-white/10 rounded-full py-2 pl-9 pr-8 text-xs text-white placeholder:text-white/40 shadow-2xl focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/50 transition-all"
        />
        {isLoading ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ccff00] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full rounded-2xl bg-[#0b0d14]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-30">
          {results.map((r, i) => (
            <button
              key={`${r.name}-${i}`}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border-b border-white/5 last:border-b-0"
            >
              {r.placeType === "country" ? (
                <Globe2 className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
              )}
              <span className="truncate flex-1">{r.placeName}</span>
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/30">
                {r.placeType === "country" ? "Country" : "City"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationSearchControl;

// src/components/LocationPicker.tsx
"use client";
import { MapPin, Search } from "lucide-react";
import { usePhilippineLocations } from "@/src/hooks/usePhilippineLocations";
import { LocationItem } from "@/src/data/location";
import { useEffect, useRef } from "react";

interface Props {
  onSelectLocation: (loc: LocationItem) => void;
  onClose: () => void;
}

export default function LocationPicker({ onSelectLocation, onClose }: Props) {
  const { query, setQuery, results, hasResults, isEmpty } = usePhilippineLocations();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    // MOBILE FIX: w-full (matches parent width), mt-2 (spacing)
    // DESKTOP: w-[350px] or keep w-full depending on preference. Here we use w-full for mobile, specific width for desktop if needed.
    <div className="absolute top-full left-0 mt-3 w-full md:w-[400px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Search Header */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-pink-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="w-full text-sm outline-none text-gray-700 placeholder-gray-400"
            placeholder="Search municipality or province..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results List - Added max-height to prevent off-screen issues */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-white">
        {!query && (
          <div className="p-6 text-center text-gray-400 text-xs">
            Start typing to find destinations in the Philippines...
          </div>
        )}

        {isEmpty && (
          <div className="p-6 text-center text-gray-400 text-sm">
            No locations found for "{query}"
          </div>
        )}

        {hasResults && Object.entries(results).map(([province, items]) => (
          <div key={province}>
            {/* Sticky Province Header */}
            <div className="sticky top-0 bg-gray-100/95 backdrop-blur-sm px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 z-10">
              {province}
            </div>
            
            {/* Items */}
            <div className="py-1">
              {items.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className="w-full text-left px-4 py-2.5 hover:bg-pink-50 flex items-center gap-3 group transition-colors"
                >
                  <div className="bg-gray-100 text-gray-500 p-1.5 rounded-full group-hover:bg-white group-hover:text-pink-500 transition-colors">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-700">
                      {loc.name}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400 group-hover:text-pink-400">
                      {loc.region}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
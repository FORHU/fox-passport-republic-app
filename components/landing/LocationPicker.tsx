// src/components/LocationPicker.tsx
"use client";
import { MapPin, Search } from "lucide-react";
import { usePhilippineLocations } from "@/hooks/usePhilippineLocations";
import { LocationItem } from "@/data/location";
import { useEffect, useRef } from "react";

interface Props {
  onSelectLocation: (loc: LocationItem) => void;
  onClose: () => void;
}

export default function LocationPicker({ onSelectLocation, onClose }: Props) {
  const { query, setQuery, results, hasResults, isEmpty } = usePhilippineLocations();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input when opened
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="absolute top-full left-0 mt-4 w-full md:w-[400px] bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()} 
    >
      
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm outline-none text-gray-900 placeholder-gray-500 font-medium"
            placeholder="Search destinations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results List */}
      <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white">
        {!query && (
          <div className="p-8 text-center">
            <div className="text-sm font-semibold text-gray-700 mb-1">Where to?</div>
            <div className="text-xs text-gray-500">Search for municipalities or cities across the Philippines.</div>
          </div>
        )}

        {isEmpty && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No locations found for &quot;{query}&quot;
          </div>
        )}

        {hasResults && Object.entries(results).map(([province, items]) => (
          <div key={province}>
            {/* Sticky Province Header */}
            <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm px-6 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 z-10">
              {province}
            </div>
            
            {/* Items */}
            <div className="py-2">
              {items.map((loc) => (
                <button
                  key={loc.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectLocation(loc);
                  }}
                  className="w-full text-left px-6 py-3 hover:bg-gray-50 flex items-center gap-4 group transition-colors"
                >
                  <div className="bg-gray-100 text-gray-400 p-2 rounded-lg group-hover:bg-white group-hover:text-pink-500 group-hover:shadow-sm transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                      {loc.name}
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-500">
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
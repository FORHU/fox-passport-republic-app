'use client';

import React, { useState, useEffect, useRef } from 'react';
import { config } from '@/shared/lib/config';

export interface MapboxContextItem {
  id: string;
  text: string;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center?: [number, number]; // [lng, lat]
  context?: MapboxContextItem[];
}

interface MapboxLocationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string, context?: MapboxContextItem[], center?: [number, number]) => void;
  type: 'country' | 'place' | 'region';
  placeholder: string;
}

export function MapboxLocationInput({ value, onChange, onSelect, type, placeholder }: MapboxLocationInputProps) {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.mapboxToken}&types=${type}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions((data.features as MapboxFeature[]) || []);
        setShowDropdown(true);
      }
    } catch (e) {
      console.warn('Mapbox error:', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        void fetchSuggestions(value);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent/50 outline-none transition-all"
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d2d] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.preventDefault();
                onSelect(s.text, s.context, s.center);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-xs text-white hover:bg-accent hover:text-black transition-colors border-b border-white/5 last:border-0"
            >
              <span className="font-bold">{s.text}</span>
              <span className="opacity-40 ml-2 italic">
                {s.place_name.replace(s.text, '').replace(/^[\s,]+/, '')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

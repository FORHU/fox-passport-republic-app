'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GalleryItem, VENUE_TYPES } from '@/data/venueBuilderData';
import { config } from '@/lib/config';

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string, context?: any) => void;
  type: 'country' | 'place' | 'region';
  placeholder: string;
}

const LocationInput = ({ value, onChange, onSelect, type, placeholder }: LocationInputProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
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
        setSuggestions(data.features || []);
        setShowDropdown(true);
      }
    } catch (e) {
      console.warn('Mapbox error:', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        fetchSuggestions(value);
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
                onSelect(s.text, s.context);
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
};

interface VenueDetailsFormProps {
  venueName: string;
  description: string;
  venueType: string;
  capacity: string;
  location: string;
  city: string;
  state: string;
  country: string;
  gallery: GalleryItem[];
  showGuide: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onTypeChange: (type: string) => void;
  onCapacityChange: (cap: string) => void;
  onLocationChange: (loc: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onCountryChange: (country: string) => void;
  onAddImage: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onCloseGuide: () => void;
}

export function VenueDetailsForm({
  venueName,
  description,
  venueType,
  capacity,
  location,
  city,
  state,
  country,
  gallery,
  showGuide,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onCapacityChange,
  onLocationChange,
  onCityChange,
  onStateChange,
  onCountryChange,
  onAddImage,
  onRemoveImage,
  onCloseGuide,
}: VenueDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onAddImage(files);
      }
      e.target.value = '';
    },
    [onAddImage]
  );

  return (
    <>
      {/* Guide Banner */}
      {showGuide && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-start gap-4 relative">
          <div className="h-6 w-6 rounded-full bg-accent text-black flex items-center justify-center font-bold shrink-0 text-xs">
            i
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Venue Builder</h4>
            <p className="text-xs text-text-muted">
              Drag <strong>included features</strong> to "Standard Features". Drag{' '}
              <strong>extras</strong> to "Monetized Add-ons".
            </p>
          </div>
          <button
            onClick={onCloseGuide}
            className="absolute top-2 right-2 text-white/30 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Form */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a] p-8">
        <div className="max-w-4xl space-y-8">
          <div className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                Venue Name
              </label>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-white/50 text-[18px]">badge</span>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Enter venue name..."
                  className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
                />
              </div>
            </div>

            {/* Type & Capacity */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  Type
                </label>
                <select
                  value={venueType}
                  onChange={(e) => onTypeChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0f111a]">Select...</option>
                  {VENUE_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0f111a]">{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  Capacity
                </label>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-white/50 text-[18px]">groups</span>
                  <input
                    value={capacity}
                    onChange={(e) => onCapacityChange(e.target.value)}
                    placeholder="e.g. 200"
                    className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
                  />
                </div>
              </div>
            </div>



            {/* Address */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                Address
              </label>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-white/50 text-[18px]">location_on</span>
                <input
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  placeholder="Full address..."
                  className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
                />
              </div>
            </div>

            {/* Country, City, State */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  Country
                </label>
                <LocationInput
                  value={country}
                  onChange={onCountryChange}
                  type="country"
                  placeholder="Country"
                  onSelect={(val: string) => onCountryChange(val)}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  City
                </label>
                <LocationInput
                  value={city}
                  onChange={onCityChange}
                  type="place"
                  placeholder="City"
                  onSelect={(val: string, context: any) => {
                    onCityChange(val);
                    const region = context?.find((c: any) => c.id.startsWith('region'))?.text;
                    const countryName = context?.find((c: any) => c.id.startsWith('country'))?.text;
                    if (region) onStateChange(region);
                    if (countryName) onCountryChange(countryName);
                  }}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  State/Province
                </label>
                <LocationInput
                  value={state}
                  onChange={onStateChange}
                  type="region"
                  placeholder="State/Province"
                  onSelect={(val: string, context: any) => {
                    onStateChange(val);
                    const countryName = context?.find((c: any) => c.id.startsWith('country'))?.text;
                    if (countryName) onCountryChange(countryName);
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe the venue..."
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white placeholder-white/30 resize-none h-32"
              />
            </div>

            {/* Gallery Section */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex justify-between items-end mb-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1 block">
                    Gallery
                  </label>
                  <p className="text-[10px] text-text-muted">Upload unique photos of your venue</p>
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                  Upload
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-auto">
                {gallery.length > 0 ? (
                  <>
                    {gallery.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-white/5"
                      >
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 z-10 bg-accent text-black text-[9px] font-bold px-2 py-0.5 rounded">
                            Cover
                          </div>
                        )}
                        <img src={img.url} className="w-full h-full object-cover" alt={img.caption || `Gallery image ${idx + 1}`} />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                    {gallery.length < 12 && (
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/20 hover:text-white hover:border-accent/40 hover:bg-white/5 transition-colors gap-1"
                      >
                        <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Add More</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="col-span-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 hover:text-white hover:border-accent/40 hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl mb-2">add_a_photo</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload Photos from Device</span>
                    <span className="text-[9px] text-white/20 mt-1">Supports JPG, PNG, WEBP · Max 12 photos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

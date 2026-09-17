"use client";

import React, { useRef, useCallback } from "react";
import {
  GalleryItem,
  VENUE_TYPES,
} from "@/features/venue/data/venueBuilderData";
import CancellationPolicyPicker from "@/shared/components/ui/CancellationPolicyPicker";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import { COUNTRIES, COUNTRY_CODES } from "@/shared/data/countries";
import {
  STATIC_CITY_LISTS,
  STATIC_REGION_LISTS,
} from "@/shared/data/locationLists";
import {
  PH_CITY_TO_PROVINCE,
  PH_TOWNS_BY_PROVINCE,
} from "@/shared/data/location";
import {
  searchCitiesInCountry,
  searchRegionsInCountry,
  geocodeCountryCenter,
} from "@/shared/lib/geocoding";
import { VenuePolygonMapPicker } from "@/features/venue/components/venue-builder/VenuePolygonMapPicker";

interface VenueDetailsFormProps {
  venueName: string;
  description: string;
  venueType: string;
  venueTypeOther: string;
  capacity: string;
  location: string;
  city: string;
  state: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  boundary?: [number, number][] | null;
  excludeVenueId?: string;
  gallery: GalleryItem[];
  showGuide: boolean;
  cancellationPolicyId: string | null;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onTypeChange: (type: string) => void;
  onTypeOtherChange: (type: string) => void;
  onCapacityChange: (cap: string) => void;
  onLocationChange: (loc: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onCountryChange: (country: string) => void;
  onLatLngChange?: (lat: number, lng: number) => void;
  onBoundaryChange?: (boundary: [number, number][] | null) => void;
  onCancellationPolicyChange: (policyId: string | null) => void;
  onAddImage: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onCloseGuide: () => void;
}

export function VenueDetailsForm({
  venueName,
  description,
  venueType,
  venueTypeOther,
  capacity,
  location,
  city,
  state,
  country,
  lat = null,
  lng = null,
  boundary = null,
  excludeVenueId,
  gallery,
  showGuide,
  cancellationPolicyId,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onTypeOtherChange,
  onCapacityChange,
  onLocationChange,
  onCityChange,
  onStateChange,
  onCountryChange,
  onLatLngChange = () => {},
  onBoundaryChange = () => {},
  onCancellationPolicyChange,
  onAddImage,
  onRemoveImage,
  onCloseGuide,
}: VenueDetailsFormProps) {
  const isPH = country === "Philippines";
  // Once a province is picked, the city list narrows to just that
  // province's towns instead of the generic curated major-cities list.
  const isPHProvinceScoped = isPH && Boolean(state && PH_TOWNS_BY_PROVINCE[state]);
  const cityOptions = isPHProvinceScoped
    ? PH_TOWNS_BY_PROVINCE[state]
    : STATIC_CITY_LISTS[country];

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
      e.target.value = "";
    },
    [onAddImage],
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
              Drag <strong>included features</strong> to &quot;Standard
              Features&quot;. Drag <strong>extras</strong> to &quot;Monetized
              Add-ons&quot;.
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
        <div className="space-y-8">
          <div className="space-y-6">
            {/* Venue Name */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                Venue Name
              </label>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-white/50 text-[18px]">
                  badge
                </span>
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
                <StyledSelect
                  value={venueType}
                  onChange={onTypeChange}
                  options={VENUE_TYPES}
                  placeholder="Select..."
                />
                {venueType === "Other" && (
                  <input
                    type="text"
                    value={venueTypeOther}
                    onChange={(e) => onTypeOtherChange(e.target.value)}
                    placeholder="Please specify the venue type..."
                    className="w-full mt-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none transition-colors"
                  />
                )}
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  Capacity
                </label>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                  <span className="material-symbols-outlined text-white/50 text-[18px]">
                    groups
                  </span>
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
                <span className="material-symbols-outlined text-white/50 text-[18px]">
                  location_on
                </span>
                <input
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  placeholder="Full address..."
                  className="bg-transparent border-none p-0 text-sm text-white placeholder-white/30 focus:ring-0 w-full"
                />
              </div>
            </div>

            {/* Country, City, State — Country drives what's offered in the
                other two: a curated static list where we have one (the
                Philippines, plus the US/Europe for cities), live Mapbox
                search scoped to the chosen country otherwise. */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  Country
                </label>
                <SearchableDropdown
                  value={country}
                  options={COUNTRIES}
                  placeholder="Select country..."
                  searchPlaceholder="Search countries..."
                  onChange={(val) => {
                    onCountryChange(val);
                    onCityChange("");
                    onStateChange("");
                    const code = val ? COUNTRY_CODES[val] : undefined;
                    if (code) {
                      geocodeCountryCenter(code).then((center) => {
                        if (center) onLatLngChange(center[1], center[0]);
                      });
                    }
                  }}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  City
                </label>
                <SearchableDropdown
                  key={`${country}-${isPHProvinceScoped ? state : ""}`}
                  value={city}
                  disabled={!country}
                  options={cityOptions}
                  asyncSearch={
                    !cityOptions && COUNTRY_CODES[country]
                      ? (q) => searchCitiesInCountry(q, COUNTRY_CODES[country])
                      : undefined
                  }
                  asyncHint="Type at least 2 letters..."
                  placeholder={
                    country ? "Select city..." : "Select a country first"
                  }
                  searchPlaceholder="Search cities..."
                  onChange={(val) => {
                    onCityChange(val);
                    // The Philippines is the one country we have a real
                    // city -> province mapping for, so picking a city there
                    // resolves the correct province automatically instead of
                    // leaving it to an unrelated alphabetical list.
                    if (isPH) {
                      const province = PH_CITY_TO_PROVINCE[val];
                      if (province && province !== state) {
                        onStateChange(province);
                      }
                    }
                  }}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                  State/Province
                </label>
                <SearchableDropdown
                  key={country || "no-country"}
                  value={state}
                  disabled={!country}
                  options={STATIC_REGION_LISTS[country]}
                  asyncSearch={
                    !STATIC_REGION_LISTS[country] && COUNTRY_CODES[country]
                      ? (q) =>
                          searchRegionsInCountry(q, COUNTRY_CODES[country])
                      : undefined
                  }
                  asyncHint="Type at least 2 letters..."
                  onChange={(val) => {
                    onStateChange(val);
                    // Narrowing/changing the province can leave a
                    // previously-picked city stranded in the wrong one —
                    // clear it rather than show a mismatched pair.
                    if (
                      isPH &&
                      city &&
                      val &&
                      !(PH_TOWNS_BY_PROVINCE[val] ?? []).includes(city)
                    ) {
                      onCityChange("");
                    }
                  }}
                  placeholder={
                    country
                      ? "Select state/province..."
                      : "Select a country first"
                  }
                  searchPlaceholder="Search states/provinces..."
                />
              </div>
            </div>

            {/* Service Area */}
            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
                Service Area
              </label>
              <VenuePolygonMapPicker
                boundary={boundary}
                focusLat={lat}
                focusLng={lng}
                excludeVenueId={excludeVenueId}
                onChange={onBoundaryChange}
              />
            </div>

            {/* Cancellation Policy */}
            <div className="max-w-xs">
              <CancellationPolicyPicker
                value={cancellationPolicyId}
                onChange={onCancellationPolicyChange}
              />
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
                  <p className="text-[10px] text-text-muted">
                    Upload unique photos of your venue
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    add_a_photo
                  </span>
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
                        <img
                          src={img.url}
                          className="w-full h-full object-cover"
                          alt={img.caption || `Gallery image ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            close
                          </span>
                        </button>
                      </div>
                    ))}
                    {gallery.length < 12 && (
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/20 hover:text-white hover:border-accent/40 hover:bg-white/5 transition-colors gap-1"
                      >
                        <span className="material-symbols-outlined text-xl">
                          add_photo_alternate
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          Add More
                        </span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="col-span-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 hover:text-white hover:border-accent/40 hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl mb-2">
                      add_a_photo
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Upload Photos from Device
                    </span>
                    <span className="text-[9px] text-white/20 mt-1">
                      Supports JPG, PNG, WEBP · Max 12 photos
                    </span>
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

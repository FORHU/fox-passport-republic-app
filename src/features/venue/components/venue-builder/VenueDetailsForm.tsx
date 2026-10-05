"use client";

import React, { useRef, useCallback } from "react";
import {
  GalleryItem,
  VENUE_TYPES,
} from "@/features/venue/data/venueBuilderData";
import CancellationPolicyPicker from "@/shared/components/ui/CancellationPolicyPicker";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import { CascadingLocationFields } from "@/shared/components/ui/CascadingLocationFields";
import { geocodeCountryCenter } from "@/shared/lib/geocoding";
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
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-surface p-8">
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

            {/* Country → State → City, each locked until the one before it is
                picked (shared/components/ui/CascadingLocationFields). A new
                country also recentres the map on it. */}
            <CascadingLocationFields
              value={{ country, state, city }}
              onChange={(next, { countryCode: code }) => {
                if (next.country !== country) {
                  if (code) {
                    geocodeCountryCenter(code).then((center) => {
                      if (center) onLatLngChange(center[1], center[0]);
                    });
                  }
                }
                onCountryChange(next.country);
                onStateChange(next.state);
                onCityChange(next.city);
              }}
              onCoordinates={(lat, lng) => onLatLngChange(lat, lng)}
            />

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

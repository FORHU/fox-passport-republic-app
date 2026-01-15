'use client';

import React from 'react';
import { GalleryItem, VENUE_TYPES } from '@/data/venueBuilderData';

interface VenueDetailsFormProps {
  venueName: string;
  description: string;
  venueType: string;
  capacity: string;
  location: string;
  gallery: GalleryItem[];
  showGuide: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onTypeChange: (type: string) => void;
  onCapacityChange: (cap: string) => void;
  onLocationChange: (loc: string) => void;
  onAddImage: () => void;
  onRemoveImage: (id: string) => void;
  onCloseGuide: () => void;
}

export function VenueDetailsForm({
  venueName,
  description,
  venueType,
  capacity,
  location,
  gallery,
  showGuide,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onCapacityChange,
  onLocationChange,
  onAddImage,
  onRemoveImage,
  onCloseGuide,
}: VenueDetailsFormProps) {
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
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1 space-y-6">
            {/* Venue Name */}
            <div>
              <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">
                Venue Name
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter venue name..."
                className="bg-transparent border-none p-0 text-4xl font-display font-bold text-white placeholder-white/10 focus:ring-0 w-full"
              />
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
          </div>

          {/* Gallery */}
          <div className="w-full md:w-72 shrink-0">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block">
              Gallery
            </label>
            <div className="grid grid-cols-2 gap-2 h-40">
              {gallery.length > 0 ? (
                <>
                  {gallery.slice(0, 4).map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-lg overflow-hidden border border-white/10 group"
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button
                        onClick={() => onRemoveImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500"
                      >
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    </div>
                  ))}
                  {gallery.length < 4 && (
                    <button
                      onClick={onAddImage}
                      className="border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={onAddImage}
                  className="col-span-2 h-full border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-white/20 hover:text-white hover:bg-white/5"
                >
                  <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                  <span className="text-[10px] font-bold uppercase">Add Photos</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

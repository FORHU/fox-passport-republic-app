'use client';

import React, { useEffect, useState } from 'react';
import { GalleryItem } from '@/features/venue/data/venueBuilderData';

interface ResourceItem {
  id: string;
  name: string;
  icon: string;
  value: number;
}

interface VenuePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  description: string;
  venueType: string;
  capacity: string;
  location: string;
  city: string;
  state: string;
  country: string;
  gallery: GalleryItem[];
  includedItems: ResourceItem[];
  addonItems: ResourceItem[];
  baseRate: number;
}

export function VenuePreviewModal({
  isOpen,
  onClose,
  venueName,
  description,
  venueType,
  capacity,
  location,
  city,
  state,
  country,
  gallery,
  includedItems,
  addonItems,
  baseRate,
}: VenuePreviewModalProps) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const coverImage = gallery[0]?.url || '/herobackground.jpg';
  const displayName = venueName || 'Untitled Venue';
  const displayLocation = [location, city, state, country].filter(Boolean).join(', ') || 'Location TBD';
  const displayType = venueType || 'Venue';
  const displayCapacity = capacity ? `${capacity} guests` : '—';

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#02040a] text-white overflow-hidden">
      {/* Preview header bar */}
      <div className="shrink-0 h-12 bg-[#ccff00] flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2 text-black text-xs font-bold">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          Preview Mode — This is how your venue page will look
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-black text-xs font-bold hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Close Preview
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero image */}
        <div className="relative w-full h-[55vh] overflow-hidden">
          <img
            src={coverImage}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/herobackground.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />

          {/* Venue type badge */}
          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {displayType}
          </div>

          {/* Title overlay at bottom */}
          <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-12">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight mb-3">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {displayLocation}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  {displayCapacity}
                </span>
                <span className="flex items-center gap-1 text-[#ccff00]">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  New listing
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery strip */}
        {gallery.length > 1 && (
          <div className="max-w-5xl mx-auto px-6 sm:px-12 -mt-4 mb-10">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {gallery.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`relative shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-[#ccff00] scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/herobackground.jpg'; }}
                  />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-[#ccff00] text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
                      Cover
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Active image preview */}
            {activeImage > 0 && (
              <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden">
                <img
                  src={gallery[activeImage]?.url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/herobackground.jpg'; }}
                />
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 sm:px-12 pb-24">
          <div className="grid lg:grid-cols-[1.8fr_1fr] gap-12">
            {/* Left column */}
            <div className="space-y-10">
              {/* Description */}
              {description && (
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">About this venue</h2>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {/* Included features */}
              {includedItems.length > 0 && (
                <div>
                  <div className="h-px bg-white/10 mb-8" />
                  <h2 className="text-xl font-display font-bold mb-2">What&apos;s included</h2>
                  <p className="text-xs text-white/40 mb-5">Standard features bundled with every booking</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {includedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-3"
                      >
                        <span className="material-symbols-outlined text-[#ccff00] text-[18px]">
                          {item.icon}
                        </span>
                        <span className="text-xs font-medium text-white/80">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-on features */}
              {addonItems.length > 0 && (
                <div>
                  <div className="h-px bg-white/10 mb-8" />
                  <h2 className="text-xl font-display font-bold mb-2">Monetized add-ons</h2>
                  <p className="text-xs text-white/40 mb-5">Optional extras guests can add to their booking</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {addonItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-xl p-3"
                      >
                        <span className="material-symbols-outlined text-[#ccff00] text-[18px] shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <div className="text-xs font-medium text-white/80">{item.name}</div>
                          {item.value > 0 && (
                            <div className="text-[10px] text-[#ccff00] font-bold mt-0.5">
                              +₱{item.value.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!description && includedItems.length === 0 && addonItems.length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <span className="material-symbols-outlined text-5xl mb-3 block">edit_document</span>
                  <p className="text-sm">Fill in the form to see your venue details here</p>
                </div>
              )}
            </div>

            {/* Right column — booking card */}
            <div className="lg:sticky lg:top-6 self-start">
              <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="mb-5">
                  <div className="text-2xl font-display font-bold text-[#ccff00]">
                    ₱{baseRate > 0 ? baseRate.toLocaleString() : '—'}
                    <span className="text-sm font-normal text-white/50 ml-1">/ night</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    New listing · {displayCapacity}
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Check-in</div>
                      <div className="text-xs font-bold text-white/60">Add date</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Check-out</div>
                      <div className="text-xs font-bold text-white/60">Add date</div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Guests</div>
                    <div className="text-xs font-bold text-white/60">Add guests</div>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-[#ccff00] text-black font-bold text-sm opacity-50 cursor-not-allowed"
                >
                  Reserve (Preview only)
                </button>

                <div className="mt-4 space-y-2 text-xs text-white/40">
                  <div className="flex justify-between">
                    <span>₱{baseRate > 0 ? baseRate.toLocaleString() : '—'} × nights</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>—</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span>—</span>
                  </div>
                </div>
              </div>

              {/* Venue details summary */}
              <div className="mt-4 bg-[#0f111a] border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
                <h3 className="font-bold text-white/80 text-sm">Venue Details</h3>
                <div className="flex justify-between text-white/50">
                  <span>Type</span>
                  <span className="text-white font-medium">{displayType}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Capacity</span>
                  <span className="text-white font-medium">{displayCapacity}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Location</span>
                  <span className="text-white font-medium text-right max-w-[55%] leading-relaxed">
                    {displayLocation}
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Photos</span>
                  <span className="text-white font-medium">{gallery.length} uploaded</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Features</span>
                  <span className="text-white font-medium">{includedItems.length} included</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Add-ons</span>
                  <span className="text-white font-medium">{addonItems.length} available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

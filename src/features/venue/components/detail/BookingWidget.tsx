'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface VenueBookingWidgetProps {
  venueId: string;
  price: number;
  billingRate?: string;
  rating: number;
  reviews: number;
  capacity?: string;
  onContactOwner: () => void;
  onCustomExperience?: () => void;
}

export function BookingWidget({
  venueId,
  price,
  billingRate = 'day',
  rating,
  reviews,
  capacity,
  onContactOwner,
  onCustomExperience,
}: VenueBookingWidgetProps) {
  const router = useRouter();

  const rateLabel = billingRate === 'hour' ? 'hr' : 'day';

  return (
    <div className="relative top-24">
      <div className="absolute inset-0 bg-purple-500/10 blur-[50px] rounded-2xl pointer-events-none transform scale-105" />
      <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-[0_0_40px_rgba(128,90,213,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

        {/* Price Header */}
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <span className="text-2xl font-display font-bold text-white">
              ₱{price.toLocaleString()}
            </span>
            <span className="text-sm text-text-muted"> / {rateLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white font-bold">
            <span className="material-symbols-outlined text-[14px] fill-current text-yellow-400">star</span>
            {rating} ·{' '}
            <span className="text-text-muted underline cursor-pointer">{reviews} reviews</span>
          </div>
        </div>

        {/* Capacity badge */}
        {capacity && (
          <div className="flex items-center gap-2 mb-4 relative z-10 text-xs text-white/60">
            <span className="material-symbols-outlined text-[16px]">groups</span>
            Up to {capacity}
          </div>
        )}

        {/* Book Now CTA */}
        <button
          onClick={() => router.push(`/booking/venue/${venueId}`)}
          className="w-full rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-3 relative z-10"
        >
          Book Now
        </button>

        {/* Contact Owner */}
        <button
          onClick={onContactOwner}
          className="w-full rounded-xl border border-white/20 py-3 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-3 relative z-10 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[18px] text-accent group-hover:text-black transition-colors">
            chat
          </span>
          Message Owner
        </button>

        {/* Custom Experience CTA */}
        {onCustomExperience && (
          <button
            onClick={onCustomExperience}
            className="w-full rounded-xl border border-white/20 py-3 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 relative z-10 flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[18px] text-accent group-hover:text-black transition-colors">design_services</span>
            Design Custom Experience
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <span className="material-symbols-outlined text-[14px]">flag</span>
        <span className="underline cursor-pointer hover:text-white">Report this listing</span>
      </div>
    </div>
  );
}

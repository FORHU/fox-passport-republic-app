'use client';

import React, { useState } from 'react';

interface VenueBookingWidgetProps {
  price: number;
  billingRate?: string;
  rating: number;
  reviews: number;
  capacity?: string;
  onRequestBook: (data: { eventDate: string; guests: number }) => void;
  onContactOwner: () => void;
  onCustomExperience?: () => void;
}

export function BookingWidget({
  price,
  billingRate = 'day',
  rating,
  reviews,
  capacity,
  onRequestBook,
  onContactOwner,
  onCustomExperience,
}: VenueBookingWidgetProps) {
  const [eventDate, setEventDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState(false);

  const rateLabel = billingRate === 'hour' ? 'hr' : 'day';
  const subtotal = price;
  const serviceFee = Math.round(price * 0.05);
  const total = subtotal + serviceFee;

  return (
    <div className="sticky top-24 relative">
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

        {/* Event Date */}
        <div className="border border-white/20 rounded-xl overflow-hidden mb-4 relative z-10">
          <div className={`p-3 border-b ${dateError ? 'border-red-500/50' : 'border-white/10'}`}>
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Event Date {dateError && <span className="text-red-400 normal-case font-normal ml-1">— required</span>}
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => { setEventDate(e.target.value); setDateError(false); }}
              className={`w-full bg-transparent text-sm font-medium focus:outline-none scheme-dark ${
                dateError ? 'text-red-300' : 'text-white'
              }`}
            />
          </div>
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">
              Number of Guests
            </label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                className="w-24 bg-transparent text-sm text-white font-medium focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="h-7 w-7 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <button
                  onClick={() => setGuests(guests + 1)}
                  className="h-7 w-7 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Request to Book CTA */}
        <button
          onClick={() => {
            if (!eventDate) {
              setDateError(true);
              return;
            }
            onRequestBook({ eventDate, guests });
          }}
          className="w-full rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-3 relative z-10"
        >
          Request to Book
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
            className="w-full rounded-xl border border-white/20 py-3 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-4 relative z-10 flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined text-[18px] text-accent group-hover:text-black transition-colors">design_services</span>
            Design Custom Experience
          </button>
        )}

        <p className="text-center text-xs text-text-muted mb-5 relative z-10">
          You won't be charged until the owner confirms.
        </p>

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm text-gray-300 relative z-10 pb-4 border-b border-white/10">
          <div className="flex justify-between">
            <span className="underline decoration-dotted cursor-pointer">
              ₱{price.toLocaleString()} × 1 {rateLabel}
            </span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline decoration-dotted cursor-pointer">Platform fee (5%)</span>
            <span>₱{serviceFee.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-white font-bold text-lg mt-4 relative z-10">
          <span>Estimated Total</span>
          <span>₱{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <span className="material-symbols-outlined text-[14px]">flag</span>
        <span className="underline cursor-pointer hover:text-white">Report this listing</span>
      </div>
    </div>
  );
}

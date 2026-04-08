import React from 'react';

interface BookingWidgetProps {
  price: number;
  rating: number;
  reviews: number;
  checkInDate: number | null;
  checkOutDate: number | null;
  nights: number;
  onReserve: () => void;
  onOpenCustomBuilder: () => void;
}

export function BookingWidget({
  price,
  rating,
  reviews,
  checkInDate,
  checkOutDate,
  nights,
  onReserve,
  onOpenCustomBuilder,
}: BookingWidgetProps) {
  return (
    <div className="sticky top-24">
      <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <span className="text-2xl font-display font-bold text-white">
              ₱{price.toLocaleString()}
            </span>
            <span className="text-sm text-text-muted"> / night</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white font-bold">
            <span className="material-symbols-outlined text-[14px] fill-current">star</span>
            {rating} ·{' '}
            <span className="text-text-muted underline cursor-pointer">{reviews} reviews</span>
          </div>
        </div>

        <div className="border border-white/20 rounded-xl overflow-hidden mb-4 relative z-10">
          <div className="grid grid-cols-2 border-b border-white/20">
            <div className="p-3 border-r border-white/20 hover:bg-white/5 cursor-pointer transition-colors relative group">
              <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">
                Check-in
              </label>
              <div className="text-sm text-white font-medium">
                {checkInDate ? `Oct ${checkInDate}` : '-'}
              </div>
            </div>
            <div className="p-3 hover:bg-white/5 cursor-pointer transition-colors group">
              <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">
                Checkout
              </label>
              <div className="text-sm text-white font-medium">
                {checkOutDate ? `Oct ${checkOutDate}` : '-'}
              </div>
            </div>
          </div>
          <div className="p-3 hover:bg-white/5 cursor-pointer transition-colors group">
            <label className="block text-[10px] font-bold uppercase text-text-muted mb-1 group-hover:text-white">
              Guests
            </label>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white font-medium">1 guest</span>
              <span className="material-symbols-outlined text-[18px] text-white">expand_more</span>
            </div>
          </div>
        </div>

        <button
          onClick={onReserve}
          className="w-full btn-neon rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-4 relative z-10"
        >
          Reserve
        </button>

        <button
          onClick={onOpenCustomBuilder}
          className="w-full rounded-xl border border-white/20 py-3.5 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-4 relative z-10 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-accent group-hover:text-black transition-colors">
            design_services
          </span>
          Design Custom Experience
        </button>

        <p className="text-center text-xs text-text-muted mb-6 relative z-10">
          You won't be charged yet
        </p>

        <div className="space-y-3 text-sm text-gray-300 relative z-10 pb-4">
          <div className="flex justify-between">
            <span className="underline decoration-dotted cursor-pointer">
              ₱{price.toLocaleString()} x {nights} nights
            </span>
            <span>₱{(price * nights).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline decoration-dotted cursor-pointer">Service fee</span>
            <span>₱150</span>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-4 relative z-10" />

        <div className="flex justify-between items-center text-white font-bold text-lg relative z-10">
          <span>Total</span>
          <span>₱{(price * nights + 150).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
        <span className="material-symbols-outlined text-[14px]">flag</span>
        <span className="underline cursor-pointer hover:text-white">Report this listing</span>
      </div>
    </div>
  );
}

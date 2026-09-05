"use client";

import React from "react";
import { useRouter } from "next/navigation";

export interface EventBookingSidebarProps {
  eventId: string;
  price: number;
  isPreview?: boolean;
  onCustomExperienceClick: () => void;
}

export function EventBookingSidebar({
  eventId,
  price,
  isPreview = false,
  onCustomExperienceClick,
}: EventBookingSidebarProps) {
  const router = useRouter();

  const handleReserve = () => {
    router.push(`/booking/config?templateId=${eventId}`);
  };

  return (
    <>
      {/* Mobile Sticky Booking Bar (docked at bottom for small phones) */}
      {!isPreview && (
        <div
          className="sm:hidden fixed bottom-5 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            background: "rgba(18,18,24,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Est. total
            </p>
            <p className="text-xl font-display font-bold text-[#ccff00]">
              {price > 0 ? `₱${price.toLocaleString()}` : "Price on request"}
            </p>
          </div>
          <button
            onClick={handleReserve}
            className="px-6 py-3 rounded-full bg-[#ccff00] text-black font-bold text-sm cursor-pointer shadow-[0_4px_16px_rgba(204,255,0,0.35)]"
          >
            Reserve
          </button>
        </div>
      )}

      {/* Desktop Sticky Widget */}
      <div className="relative">
        <div className="sticky top-24">
          <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-glow relative overflow-hidden bg-surface-highlight/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="mb-6 relative z-10">
              {price > 0 ? (
                <>
                  <span className="text-2xl font-display font-bold text-white">
                    ₱{price.toLocaleString()}
                  </span>
                  <span className="text-sm text-text-muted"> est. total</span>
                </>
              ) : (
                <span className="text-sm text-text-muted">
                  Price on request
                </span>
              )}
            </div>

            {isPreview ? (
              <div className="w-full rounded-xl border border-dashed border-white/15 py-3.5 text-white/30 text-sm font-bold text-center mb-4 relative z-10">
                Booking available after publishing
              </div>
            ) : (
              <>
                <button
                  onClick={handleReserve}
                  className="w-full btn-neon rounded-xl bg-accent py-3.5 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 mb-4 relative z-10 cursor-pointer"
                >
                  Reserve
                </button>
                <button
                  onClick={onCustomExperienceClick}
                  className="w-full rounded-xl border border-white/20 py-3.5 text-white font-bold text-sm hover:bg-white hover:text-black transition-all active:scale-95 mb-4 relative z-10 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-accent group-hover:text-black transition-colors">
                    design_services
                  </span>
                  Design Custom Experience
                </button>
                <p className="text-center text-xs text-text-muted mb-6 relative z-10">
                  You won&apos;t be charged yet
                </p>
              </>
            )}

            {price > 0 && (
              <>
                <div className="space-y-3 text-sm text-gray-300 relative z-10 pb-4">
                  <div className="flex justify-between">
                    <span>Package estimate</span>
                    <span>₱{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>₱150</span>
                  </div>
                </div>
                <div className="h-px bg-white/10 mb-4 relative z-10" />
                <div className="flex justify-between items-center text-white font-bold text-lg relative z-10">
                  <span>Total</span>
                  <span>₱{(price + 150).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

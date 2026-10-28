"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Money } from "@/shared/components/ui/Money";
import { useAuthStore, type BookingSummary } from "@/shared/auth/useAuthStore";
import { signInThen, signUpThen } from "@/shared/auth/returnTo";

export interface EventBookingSidebarProps {
  eventId: string;
  /** The API's estimate, platform fee included. */
  price: number;
  /** The platform fee inside `price`, or null when unknown (added at checkout). */
  platformFee?: number | null;
  isPreview?: boolean;
  onCustomExperienceClick: () => void;
  /** Shown beside the sign-up form when a signed-out visitor reserves. */
  bookingSummary?: BookingSummary;
}

export function EventBookingSidebar({
  eventId,
  price,
  platformFee = null,
  isPreview = false,
  onCustomExperienceClick,
  bookingSummary,
}: EventBookingSidebarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  // `price` already carries the fee when the API priced it, so the package
  // line is the remainder and the total is `price` itself — never fee + fee.
  const packageAmount = platformFee === null ? price : price - platformFee;

  // /booking is protected: signed out, sign in here and resume after, rather
  // than being bounced to the landing page by proxy.ts.
  const handleReserve = () => {
    const path = `/booking/config?templateId=${eventId}`;
    if (user) router.push(path);
    else if (bookingSummary) signUpThen(path, bookingSummary);
    else signInThen(path);
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
            border: "1px solid color-mix(in srgb, var(--color-white) 10%, transparent)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
              Est. total
            </p>
            <p className="text-xl font-display font-bold text-accent">
              {price > 0 ? <Money amount={price} /> : "Price on request"}
            </p>
          </div>
          <button
            onClick={handleReserve}
            className="px-6 py-3 rounded-full bg-accent text-black font-bold text-sm cursor-pointer shadow-[0_4px_16px_rgba(196,232,90,0.35)]"
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
                    <Money amount={price} />
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
                  className="w-full btn-neon rounded-xl bg-accent py-3.5 text-black font-bold text-lg transition-all active:scale-95 mb-4 relative z-10 cursor-pointer"
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
                    <span>
                      <Money amount={packageAmount} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>
                      {platformFee === null ? (
                        <span className="text-white/40">Added at checkout</span>
                      ) : (
                        <Money amount={platformFee} />
                      )}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-white/10 mb-4 relative z-10" />
                <div className="flex justify-between items-center text-white font-bold text-lg relative z-10">
                  <span>Total</span>
                  <span>
                    <Money amount={price} />
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

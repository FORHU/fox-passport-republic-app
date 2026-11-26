"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCancellationPolicies } from "@/shared/api/cancellation-policies";
import { useCurrency } from "@/shared/providers/CurrencyProvider";
import { ServiceListingSummaryCard } from "./ServiceListingSummaryCard";

/** The rate suffix customers see, e.g. "₱100.00 / hr". */
const RATE_SUFFIX: Record<string, string> = {
  "Per Hour": "hr",
  "Per Day": "day",
  "Per Week": "week",
  "Per Month": "month",
  "Per Year": "year",
  "One Time": "one time",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  unavailable: "Unavailable",
};

export interface ServicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** What the Studio calls the listing: "service" or "gig". */
  lowerNoun: string;
  title: string;
  description: string;
  displayCategory: string;
  /** The picked image: an uploaded URL or the Studio's local data URL. */
  image: string;
  price: number;
  unit: string;
  status: string;
  cancellationPolicyId: string | null;
  /** Left out where the Studio can't edit the location (the edit page). */
  city?: string;
  country?: string;
}

/**
 * The listing as customers will see it, built from the Studio's unsaved
 * form. Closing it only hides it: the form keeps everything.
 */
export function ServicePreviewModal({
  open,
  onClose,
  lowerNoun,
  title,
  description,
  displayCategory,
  image,
  price,
  unit,
  status,
  cancellationPolicyId,
  city,
  country,
}: ServicePreviewModalProps) {
  const { format } = useCurrency();
  const backRef = useRef<HTMLButtonElement>(null);

  // Same key and cache as the Studio's CancellationPolicyPicker.
  const { data: policies } = useQuery({
    queryKey: ["cancellation-policies"],
    queryFn: fetchCancellationPolicies,
    staleTime: 10 * 60_000,
    enabled: open,
  });
  const policy = policies?.find((p) => p.id === cancellationPolicyId);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const name = title.trim() || `Untitled ${lowerNoun}`;
  const suffix = RATE_SUFFIX[unit];
  const rateLabel = suffix ? `${format(price)} / ${suffix}` : format(price);
  const location = [city, country].filter(Boolean).join(", ");
  const showLocation = city !== undefined || country !== undefined;
  const statusLabel = STATUS_LABELS[status];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${name}`}
      className="fixed inset-0 z-300 overflow-y-auto bg-background bg-gradient-dark text-text-main font-body animate-in fade-in duration-150"
    >
      {/* Preview bar */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-accent text-[20px]">
              visibility
            </span>
            <p className="text-sm text-white truncate">
              <span className="font-bold">Preview</span>
              <span className="text-text-muted">
                {" "}
                · not yet published. This is how customers will see your{" "}
                {lowerNoun}.
              </span>
            </p>
          </div>
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to editing
          </button>
        </div>
      </div>

      <main className="pt-8 sm:pt-12 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb + heading, as on the public page */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4 min-w-0">
              <span>Browse</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-white/60">Services</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-accent font-semibold truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-orange-400/20 border border-orange-400/30 rounded-full text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                Service Hire
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
              Book This Service
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: what the creator entered */}
            <div className="lg:col-span-8 space-y-8">
              <PreviewSection icon="description" title="About">
                {description.trim() ? (
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line break-words">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm text-white/30 italic">
                    No description yet.
                  </p>
                )}
              </PreviewSection>

              {showLocation && (
                <PreviewSection icon="location_on" title="Location">
                  {location ? (
                    <p className="text-sm text-white/80">{location}</p>
                  ) : (
                    <p className="text-sm text-white/30 italic">
                      No location yet.
                    </p>
                  )}
                </PreviewSection>
              )}

              <PreviewSection icon="policy" title="Cancellation Policy">
                {policy ? (
                  <>
                    <p className="text-sm font-bold text-white">
                      {policy.name}
                    </p>
                    {policy.description && (
                      <p className="text-sm text-white/60 mt-1">
                        {policy.description}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-white/30 italic">
                    No cancellation policy picked yet.
                  </p>
                )}
              </PreviewSection>

              <PreviewSection icon="event" title="Schedule">
                <p className="text-sm text-white/60">
                  Customers pick their dates, duration and guests here, from
                  your availability calendar.
                </p>
              </PreviewSection>
            </div>

            {/* Right: the public summary card */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                <ServiceListingSummaryCard
                  name={name}
                  category={displayCategory}
                  imageUrl={image || null}
                  rateLabel={rateLabel}
                  footer={
                    <>
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-xl bg-accent py-4 text-black font-bold text-lg flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
                      >
                        Proceed to Payment
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </button>
                      <p className="text-center text-[10px] text-text-muted mt-3">
                        Booking is off in preview.
                      </p>
                    </>
                  }
                >
                  {statusLabel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Status</span>
                      <span className="text-white font-medium">
                        {statusLabel}
                      </span>
                    </div>
                  )}
                </ServiceListingSummaryCard>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>,
    document.body,
  );
}

function PreviewSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-accent text-2xl">
          {icon}
        </span>
        <h2 className="text-xl font-display font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

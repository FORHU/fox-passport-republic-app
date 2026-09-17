"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchVenueById } from "@/features/venue/api/venues";
import {
  bookVenueDraft,
  previewVenueBookingPrice,
} from "@/features/booking/api/bookings";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { StepperControl } from "@/shared/components/ui/StepperControl";
import { ProgressIndicator } from "@/shared/components/ui/ProgressIndicator";
import { FormSection } from "@/shared/components/ui/FormSection";
import { PaymentProtectionTimeline } from "@/shared/components/ui/PaymentProtectionTimeline";
import DateRangePicker, {
  diffDays,
} from "@/shared/components/ui/DateRangePicker";
import { toast } from "sonner";
import { toastRequireLogin } from "@/shared/lib/toast";
import { getDashboardPath } from "@/shared/lib/dashboard-path";
import { useCurrency } from "@/shared/providers/CurrencyProvider";

const SERVICE_FEE_RATE = 0.1;

export default function VenueBookingClient({ venueId }: { venueId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, openLogin } = useAuthStore();
  const { format } = useCurrency();

  const [venue, setVenue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<{ dates?: string }>({});

  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(
    null,
  );
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);

  useEffect(() => {
    fetchVenueById(venueId)
      .then(setVenue)
      .catch(() => toast.error("Could not load venue details."))
      .finally(() => setIsLoading(false));
  }, [venueId]);

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const baseRate = Number(venue?.price ?? 0);
  const days = useMemo(
    () => diffDays(startDate, endDate),
    [startDate, endDate],
  );
  const subtotal = baseRate * days * guestCount;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = Math.max(0, subtotal + serviceFee - voucherDiscount);

  const imageUrl =
    venue?.images?.[0]?.url ?? venue?.images?.[0]?.imageUrl ?? null;

  // Reset a previously-applied voucher when the dates change — a discount
  // validated against one date range isn't guaranteed valid for another.
  useEffect(() => {
    setAppliedVoucherCode(null);
    setVoucherDiscount(0);
    setVoucherError(null);
  }, [startDate, endDate]);

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    if (!startDate || !endDate) {
      setVoucherError("Pick your dates first.");
      return;
    }
    setVoucherChecking(true);
    setVoucherError(null);
    try {
      const preview = await previewVenueBookingPrice({
        venueId,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
        voucherCode: voucherCodeInput.trim(),
      });
      setAppliedVoucherCode(voucherCodeInput.trim().toUpperCase());
      setVoucherDiscount(preview.discountAmount);
      setAutoApplied(false);
      toast.success("Voucher applied.");
    } catch (err: any) {
      setAppliedVoucherCode(null);
      setVoucherDiscount(0);
      setVoucherError(
        err?.response?.data?.message || "Invalid or expired voucher code.",
      );
    } finally {
      setVoucherChecking(false);
    }
  };

  // Silently checks for an auto-apply, no-code-needed promotion whenever the
  // dates change — skipped once the citizen has typed their own code.
  useEffect(() => {
    if (!startDate || !endDate || voucherCodeInput.trim()) return;
    let cancelled = false;
    previewVenueBookingPrice({
      venueId,
      startDate: new Date(`${startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${endDate}T23:59:59`).toISOString(),
    })
      .then((preview) => {
        if (cancelled) return;
        if (preview.discountAmount > 0 && preview.voucherCode) {
          setAppliedVoucherCode(preview.voucherCode);
          setVoucherDiscount(preview.discountAmount);
          setAutoApplied(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
     
  }, [venueId, startDate, endDate, voucherCodeInput]);

  const handleProceed = async () => {
    if (!startDate || !endDate) {
      setErrors({ dates: "Please select both start and end dates." });
      return;
    }
    setErrors({});
    if (!venue) return;

    if (!isAuthenticated) {
      toastRequireLogin("Please log in to complete your booking.");
      openLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bookVenueDraft({
        venueId,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59`).toISOString(),
        guestCount,
        totalAmount: total,
        specialRequests: specialRequests.trim() || undefined,
        voucherCode: appliedVoucherCode ?? undefined,
      });

      router.push(
        `/booking/venue/checkout?bookingId=${result.bookingId}&total=${total}&subtotal=${subtotal}&serviceFee=${serviceFee}`,
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not create booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          <p className="text-text-muted text-sm">Loading venue detailsâ€¦</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background bg-gradient-dark flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Venue Not Found
          </h2>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-colors"
          >
            Browse Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link
              href="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/foxonlylogo.png"
                  alt="FoxPassport Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Explore
              </Link>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent hover:bg-accent/90 transition-all"
              >
                Bookings
              </Link>
            </nav>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(getDashboardPath(user))}
            >
              {user?.imgId ? (
                <img
                  alt="User"
                  className="h-full w-full object-cover"
                  src={user.imgId}
                />
              ) : (
                <div className="h-full w-full bg-[#ccff00] flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb + heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Explore
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-white/60">Venues</span>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-accent font-semibold">{venue.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    Venue Direct Booking
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                  Book This Venue
                </h1>
              </div>
              <ProgressIndicator
                steps={[
                  { number: 1, label: "Configure" },
                  { number: 2, label: "Pay" },
                ]}
                currentStep={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            {/* Left: Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Date Range */}
              <FormSection icon="date_range" title="Select Dates">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={(d) => {
                    setStartDate(d);
                    setErrors({});
                  }}
                  onEndChange={(d) => {
                    setEndDate(d);
                    setErrors({});
                  }}
                  errors={errors}
                  startLabel="Start Date"
                  endLabel="End Date"
                  showSummary={false}
                />
              </FormSection>

              {/* Guest Count */}
              <FormSection icon="group" title="Number of Guests">
                <StepperControl
                  value={guestCount}
                  onChange={setGuestCount}
                  min={1}
                  step={1}
                  label="Total Guests"
                  icon="person"
                />
              </FormSection>

              {/* Special Requests */}
              <FormSection icon="edit_note" title="Special Requests">
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-32 outline-none"
                  placeholder="Any special requirements, setup needs, or questions for the venue owner..."
                />
              </FormSection>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-glow">
                  <div className="relative h-48">
                    {imageUrl ? (
                      <img
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        src={imageUrl}
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-highlight/50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-[64px]">
                          apartment
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/50 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {venue.category ?? "Venue"}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white leading-tight">
                        {venue.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Rate</span>
                      <span className="text-white font-medium">
                        {format(baseRate)} / guest / day
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Duration</span>
                      <span className="text-white font-medium">
                        {days} day{days !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Guests</span>
                      <span className="text-white font-medium">
                        × {guestCount}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="text-white">
                        {format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Service Fee (10%)</span>
                      <span className="text-white">
                        {format(serviceFee)}
                      </span>
                    </div>

                    <div className="pt-1">
                      {appliedVoucherCode ? (
                        <div className="flex items-center justify-between text-sm bg-accent/10 border border-accent/20 rounded-xl px-3 py-2">
                          <span className="text-accent font-semibold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">
                              sell
                            </span>
                            {autoApplied
                              ? "Discount applied automatically"
                              : `${appliedVoucherCode} applied`}
                          </span>
                          {!autoApplied && (
                            <button
                              onClick={() => {
                                setAppliedVoucherCode(null);
                                setVoucherDiscount(0);
                                setVoucherCodeInput("");
                              }}
                              className="text-white/40 hover:text-white text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={voucherCodeInput}
                            onChange={(e) => {
                              setVoucherCodeInput(e.target.value);
                              setVoucherError(null);
                            }}
                            placeholder="Voucher code"
                            className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-text-muted/50 focus:border-accent outline-none transition-all uppercase"
                          />
                          <button
                            onClick={handleApplyVoucher}
                            disabled={voucherChecking || !voucherCodeInput.trim()}
                            className="shrink-0 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all disabled:opacity-50"
                          >
                            {voucherChecking ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                      {voucherError && (
                        <p className="text-red-400 text-xs mt-1.5">
                          {voucherError}
                        </p>
                      )}
                    </div>

                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-accent">Voucher discount</span>
                        <span className="text-accent">
                          -{format(voucherDiscount)}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">
                        Total
                      </span>
                      <span className="text-2xl font-display font-bold text-accent">
                        {format(total)}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      disabled={isSubmitting}
                      onClick={handleProceed}
                      className="w-full rounded-xl bg-accent py-4 text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-5 w-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />{" "}
                          Creating bookingâ€¦
                        </>
                      ) : (
                        <>
                          Proceed to Payment{" "}
                          <span className="material-symbols-outlined">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-text-muted mt-3">
                      <span className="material-symbols-outlined text-[12px] align-middle mr-1">
                        lock
                      </span>
                      Secure encrypted checkout · Payment held safely until confirmed
                    </p>
                  </div>
                </div>

                <PaymentProtectionTimeline />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black pt-10 pb-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white">
                explore
              </span>
              <span className="text-xl font-display font-bold text-white">
                FoxPassport
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Â© 2024 FoxPassport Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

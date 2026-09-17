"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { fetchFoxerBookings } from "@/features/booking/api/bookings";
import ProviderBookingRowActions from "@/features/booking/components/ProviderBookingRowActions";
import {
  fetchMyPayouts,
  PAYOUT_SOURCE_LABEL,
  type Payout,
} from "@/features/dashboard/api/payouts";
import { formatCurrency } from "@/shared/lib/currency";

type Booking = Record<string, unknown>;

const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; icon: string; tip: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: "schedule",
    tip: "Waiting for client payment confirmation.",
  },
  confirmed: {
    label: "Payment Held",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
    icon: "lock",
    tip: "Client already paid. We're holding it safely until they confirm you showed up.",
  },
  active: {
    label: "Releasing",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: "send_money",
    tip: "Client confirmed your arrival. Funds are releasing.",
  },
  completed: {
    label: "Paid Out",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: "check_circle",
    tip: "Payment has been wired to your account.",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-white/40",
    bg: "bg-white/5 border-white/10",
    icon: "cancel",
    tip: "Booking was cancelled.",
  },
  disputed: {
    label: "Disputed",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    icon: "warning",
    tip: "Client reported an issue. Our team is reviewing.",
  },
};

// Roles whose held-payment flow runs through the asset/service booking
// APIs `fetchFoxerBookings` reads — venueFoxer (Mayor) gets paid through
// EventVenueTransaction and eventFoxer (Host) through the host markup,
// neither of which is a service/asset booking, and investor never has
// bookings at all. Showing the held-payment cards + booking list to those
// three would just be an empty "No bookings yet" even once they're actively
// getting paid — their real payout record is the ledger below, which reads
// from the role-agnostic `/payouts/me` instead.
const BOOKING_PAYOUT_ROLES = ["gearFoxer", "serviceFoxer", "performerFoxer"];

export default function FoxerEarningsClient() {
  const { user } = useAuthStore();
  const roleType = user?.roleType ?? [];
  const hasBookingPayouts = roleType.some((r) =>
    BOOKING_PAYOUT_ROLES.includes(r),
  );
  const isInvestor = roleType.includes("investor");

  const [serviceBookings, setServiceBookings] = useState<Booking[]>([]);
  const [assetBookings, setAssetBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutTotals, setPayoutTotals] = useState({ paid: 0, pending: 0 });
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [bookingsVersion, setBookingsVersion] = useState(0);

  useEffect(() => {
    fetchMyPayouts(1, 20)
      .then(({ payouts, totals }) => {
        setPayouts(payouts);
        setPayoutTotals(totals);
      })
      .catch(() => {})
      .finally(() => setPayoutsLoading(false));
  }, []);

  useEffect(() => {
    if (!hasBookingPayouts) {
      setLoading(false);
      return;
    }
    const id = user?.id ?? (user as { userId?: string })?.userId;
    if (!id) return;
    fetchFoxerBookings(id)
      .then(({ services, assets }) => {
        setServiceBookings(services);
        setAssetBookings(assets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, hasBookingPayouts, bookingsVersion]);

  const allBookings: any[] = (
    [
      ...serviceBookings.map((b) => ({ ...b, _type: "service" as const })),
      ...assetBookings.map((b) => ({ ...b, _type: "asset" as const })),
    ] as any[]
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const heldTotal = allBookings
    .filter((b) => ["pending", "confirmed"].includes(b.status))
    .reduce((s, b) => s + Number(b.totalAmount), 0);
  const releasedTotal = allBookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + Number(b.totalAmount), 0);
  const lifetimeTotal = allBookings
    .filter((b) => !["cancelled", "disputed"].includes(b.status))
    .reduce((s, b) => s + Number(b.totalAmount), 0);

  const heldCount = allBookings.filter((b) =>
    ["pending", "confirmed"].includes(b.status),
  ).length;
  const completedCount = allBookings.filter(
    (b) => b.status === "completed",
  ).length;

  return (
    <div className="space-y-6">
      {!hasBookingPayouts && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[24px] text-accent">
              {isInvestor ? "trending_up" : "receipt_long"}
            </span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {isInvestor
                ? "Revenue Share Payouts"
                : "Payouts From Your Bookings"}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {isInvestor
                ? "Your revenue-share cut is carved out automatically whenever a venue or event you've invested in gets paid — there's no holding period on your side."
                : "Your venue and event bookings are tracked on the Calendar and Venues/Events pages. The ledger below is your actual Stripe transfer record."}
            </p>
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      {hasBookingPayouts && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Payment Held",
            amount: heldTotal,
            icon: "lock",
            color: "text-accent",
            desc: `${heldCount} pending`,
          },
          {
            label: "Paid Out",
            amount: releasedTotal,
            icon: "check_circle",
            color: "text-green-400",
            desc: `${completedCount} completed`,
          },
          {
            label: "Lifetime",
            amount: lifetimeTotal,
            icon: "payments",
            color: "text-white",
            desc: `${allBookings.filter((b) => !["cancelled", "disputed"].includes(b.status)).length} total`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="glass-panel rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`material-symbols-outlined text-[20px] ${card.color}`}
              >
                {card.icon}
              </span>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                {card.label}
              </p>
            </div>
            <p
              className={`text-2xl font-display font-bold ${card.color} mb-0.5`}
            >
              {formatCurrency(card.amount)}
            </p>
            <p className="text-xs text-white/30">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-accent">
            info
          </span>
          How Payouts Work
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: "shopping_cart",
              step: "01",
              label: "Client Books & Pays",
              desc: "The client pays upfront via Stripe. We hold that payment safely — it isn't released to you yet.",
            },
            {
              icon: "qr_code_scanner",
              step: "02",
              label: "You Show Up",
              desc: 'Deliver your service or equipment. The client taps "Confirm Arrival" on their Fulfillment Pass.',
            },
            {
              icon: "send_money",
              step: "03",
              label: "Funds Wire to You",
              desc: "Once confirmed, the held payment is released and wired to your payout account within 3–5 business days.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-accent">
                    {s.icon}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-0.5">
                  {s.step}
                </p>
                <p className="text-white text-sm font-bold mb-1">{s.label}</p>
                <p className="text-white/40 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}

      {/* Stripe Connect CTA */}
      <div className="glass-panel rounded-2xl p-5 border border-dashed border-accent/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[24px] text-accent">
              account_balance
            </span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              Set Up Your Payout Account
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              Connect your bank account to receive automatic payouts.
            </p>
          </div>
        </div>
        <Link
          href="/creator-dashboard/stripe-onboard"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:bg-accent/90 active:scale-95 transition-all"
        >
          Connect Bank
        </Link>
      </div>

      {/* Payout Ledger — the actual Stripe Transfer record, distinct from
          the held-payment/lifetime cards above (which are inferred from booking
          gross totals). This is per-transfer net amounts, including venue/
          host-markup/investor-revenue-share payouts the cards above never
          covered. */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-white/30">
            receipt_long
          </span>
          Payout Ledger
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">
              Paid Out
            </p>
            <p className="text-xl font-display font-bold text-green-400">
              {formatCurrency(payoutTotals.paid)}
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">
              Pending
            </p>
            <p className="text-xl font-display font-bold text-yellow-400">
              {formatCurrency(payoutTotals.pending)}
            </p>
          </div>
        </div>

        {payoutsLoading ? (
          <div className="flex items-center justify-center py-10">
            <span className="animate-spin material-symbols-outlined text-accent text-3xl">
              progress_activity
            </span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 border border-white/10 text-center">
            <p className="text-white/40 text-sm">No payouts yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="glass-panel rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {PAYOUT_SOURCE_LABEL[payout.sourceType] ??
                      payout.sourceType}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {new Date(payout.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white font-bold font-display">
                    {formatCurrency(payout.payoutAmount)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      payout.status === "paid"
                        ? "text-green-400 bg-green-400/10 border border-green-400/20"
                        : payout.status === "pending"
                          ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                          : "text-red-400 bg-red-400/10 border border-red-400/20"
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking List */}
      {hasBookingPayouts && (
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-white/30">
            list_alt
          </span>
          Your Bookings
          <span className="text-white/30 font-normal normal-case tracking-normal">
            ({allBookings.length})
          </span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin material-symbols-outlined text-accent text-3xl">
              progress_activity
            </span>
          </div>
        ) : allBookings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 border border-white/10 text-center">
            <span className="material-symbols-outlined text-white/10 text-6xl block mb-3">
              inbox
            </span>
            <p className="text-white/40 text-sm">No bookings yet.</p>
            <p className="text-white/20 text-xs mt-1">
              Once clients book your services or equipment, they&apos;ll appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allBookings.map((booking) => {
              const item =
                booking._type === "service" ? booking.service : booking.asset;
              const client = booking.user;
              const cfg = STATUS_CFG[booking.status] ?? STATUS_CFG.pending;
              const date =
                booking._type === "service"
                  ? booking.scheduledDate
                  : booking.startDate;
              const image = item?.images?.[0]?.url;

              return (
                <div
                  key={booking.id}
                  className="glass-panel rounded-2xl p-5 border border-white/10 flex gap-4 hover:border-white/20 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    {image ? (
                      <Image
                        src={image}
                        alt={item?.name ?? ""}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-2xl">
                          {booking._type === "service"
                            ? "build"
                            : "inventory_2"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white font-bold text-sm truncate">
                        {item?.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1 ${cfg.color} ${cfg.bg}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[12px]">
                        person
                      </span>
                      {client?.name}
                      <span className="mx-1 text-white/20">·</span>
                      <span className="material-symbols-outlined text-[12px]">
                        event
                      </span>
                      {new Date(date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-white/25 italic">{cfg.tip}</p>
                  </div>

                  {/* Amount + CTA */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
                    <p className="text-accent font-bold font-display text-lg">
                      {formatCurrency(Number(booking.totalAmount))}
                    </p>
                    <ProviderBookingRowActions
                      bookingType={booking._type}
                      bookingId={booking.id}
                      status={booking.status}
                      onChanged={() => setBookingsVersion((v) => v + 1)}
                    />
                    <Link
                      href={`/booking/fulfillment/${booking._type}/${booking.id}`}
                      className="text-xs text-white/30 hover:text-accent transition-colors flex items-center gap-1 group-hover:text-white/60"
                    >
                      View Pass
                      <span className="material-symbols-outlined text-[14px]">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

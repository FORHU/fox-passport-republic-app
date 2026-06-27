'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchFoxerBookings } from '@/features/booking/api/bookings';

type AnyBooking = any;

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string; tip: string }> = {
  pending:   { label: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: 'schedule',     tip: 'Waiting for client payment confirmation.' },
  confirmed: { label: 'In Escrow',  color: 'text-accent',     bg: 'bg-accent/10 border-accent/20',         icon: 'lock',         tip: 'Payment secured. Awaiting client arrival confirmation.' },
  active:    { label: 'Releasing',  color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     icon: 'send_money',   tip: 'Client confirmed your arrival. Funds are releasing.' },
  completed: { label: 'Paid Out',   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',   icon: 'check_circle', tip: 'Payment has been wired to your account.' },
  cancelled: { label: 'Cancelled',  color: 'text-white/40',   bg: 'bg-white/5 border-white/10',            icon: 'cancel',       tip: 'Booking was cancelled.' },
  disputed:  { label: 'Disputed',   color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       icon: 'warning',      tip: 'Client reported an issue. Our team is reviewing.' },
};

export default function FoxerEarningsClient() {
  const { user } = useAuthStore();
  const [serviceBookings, setServiceBookings] = useState<AnyBooking[]>([]);
  const [assetBookings, setAssetBookings]     = useState<AnyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = user?.id ?? (user as any)?.userId;
    if (!id) return;
    fetchFoxerBookings(id)
      .then(({ services, assets }) => {
        setServiceBookings(services);
        setAssetBookings(assets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const allBookings: (AnyBooking & { _type: 'service' | 'asset' })[] = [
    ...serviceBookings.map(b => ({ ...b, _type: 'service' as const })),
    ...assetBookings.map(b => ({ ...b, _type: 'asset' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const escrowTotal   = allBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).reduce((s, b) => s + b.totalAmount, 0);
  const releasedTotal = allBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalAmount, 0);
  const lifetimeTotal = allBookings.filter(b => !['cancelled', 'disputed'].includes(b.status)).reduce((s, b) => s + b.totalAmount, 0);

  const escrowCount   = allBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
  const completedCount = allBookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'In Escrow',    amount: escrowTotal,   icon: 'lock',         color: 'text-accent',     desc: `${escrowCount} pending` },
          { label: 'Released',     amount: releasedTotal, icon: 'check_circle', color: 'text-green-400',  desc: `${completedCount} completed` },
          { label: 'Lifetime',     amount: lifetimeTotal, icon: 'payments',     color: 'text-white',      desc: `${allBookings.filter(b => !['cancelled','disputed'].includes(b.status)).length} total` },
        ].map(card => (
          <div key={card.label} className="glass-panel rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{card.label}</p>
            </div>
            <p className={`text-2xl font-display font-bold ${card.color} mb-0.5`}>₱{card.amount.toLocaleString()}</p>
            <p className="text-xs text-white/30">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-accent">info</span>
          How Escrow Payouts Work
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: 'shopping_cart',    step: '01', label: 'Client Books & Pays',    desc: 'Client pays upfront via Stripe. Their money goes into escrow — not released to you yet.' },
            { icon: 'qr_code_scanner',  step: '02', label: 'You Show Up',            desc: 'Deliver your service or equipment. The client taps "Confirm Arrival" on their Fulfillment Pass.' },
            { icon: 'send_money',       step: '03', label: 'Funds Wire to You',       desc: 'Once confirmed, funds are released and transferred to your payout account within 3–5 business days.' },
          ].map(s => (
            <div key={s.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-accent">{s.icon}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-0.5">{s.step}</p>
                <p className="text-white text-sm font-bold mb-1">{s.label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Connect CTA */}
      <div className="glass-panel rounded-2xl p-5 border border-dashed border-accent/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[24px] text-accent">account_balance</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Set Up Your Payout Account</p>
            <p className="text-white/40 text-xs mt-0.5">Connect your bank account to receive automatic payouts when escrow releases.</p>
          </div>
        </div>
        <button className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-accent text-black font-bold text-sm hover:bg-accent/90 active:scale-95 transition-all">
          Connect Bank
        </button>
      </div>

      {/* Booking List */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-white/30">list_alt</span>
          Your Bookings
          <span className="text-white/30 font-normal normal-case tracking-normal">({allBookings.length})</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="animate-spin material-symbols-outlined text-accent text-3xl">progress_activity</span>
          </div>
        ) : allBookings.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 border border-white/10 text-center">
            <span className="material-symbols-outlined text-white/10 text-6xl block mb-3">inbox</span>
            <p className="text-white/40 text-sm">No bookings yet.</p>
            <p className="text-white/20 text-xs mt-1">Once clients book your services or equipment, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allBookings.map(booking => {
              const item   = booking._type === 'service' ? booking.service : booking.asset;
              const client = booking.user;
              const cfg    = STATUS_CFG[booking.status] ?? STATUS_CFG.pending;
              const date   = booking._type === 'service' ? booking.scheduledDate : booking.startDate;
              const image  = item?.images?.[0]?.url;

              return (
                <div key={booking.id} className="glass-panel rounded-2xl p-5 border border-white/10 flex gap-4 hover:border-white/20 transition-all group">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    {image
                      ? <img src={image} alt={item?.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/20 text-2xl">
                            {booking._type === 'service' ? 'build' : 'inventory_2'}
                          </span>
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white font-bold text-sm truncate">{item?.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1 ${cfg.color} ${cfg.bg}`}>
                        <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs flex items-center gap-1 mb-1.5">
                      <span className="material-symbols-outlined text-[12px]">person</span>
                      {client?.name}
                      <span className="mx-1 text-white/20">·</span>
                      <span className="material-symbols-outlined text-[12px]">event</span>
                      {new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-white/25 italic">{cfg.tip}</p>
                  </div>

                  {/* Amount + CTA */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <p className="text-accent font-bold font-display text-lg">₱{booking.totalAmount?.toLocaleString()}</p>
                    <Link
                      href={`/booking/fulfillment/${booking._type}/${booking.id}`}
                      className="text-xs text-white/30 hover:text-accent transition-colors flex items-center gap-1 group-hover:text-white/60"
                    >
                      View Pass
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

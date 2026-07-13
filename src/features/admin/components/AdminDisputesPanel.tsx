'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import toast from 'react-hot-toast';

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function money(n: number) {
  return `₱${Number(n ?? 0).toLocaleString()}`;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-white/20">
      <span className="material-symbols-outlined text-[48px]">gavel</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ── Refund Disputes tab ───────────────────────────────────────────────────────

function RefundDisputesTab() {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: disputes = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin', 'disputes'],
    queryFn: () => api.get('/admin/disputes').then(r => r.data.data),
  });

  const resolve = useMutation({
    mutationFn: ({ id, action, adminNotes }: { id: string; action: 'approve' | 'reject'; adminNotes?: string }) =>
      api.patch(`/admin/disputes/${id}/resolve`, { action, adminNotes }),
    onSuccess: () => {
      toast.success('Dispute resolved');
      qc.invalidateQueries({ queryKey: ['admin', 'disputes'] });
    },
    onError: () => toast.error('Failed to resolve dispute'),
  });

  if (isLoading) return <div className="py-16 text-center text-white/30 text-sm">Loading…</div>;
  if (!disputes.length) return <Empty label="No refund disputes." />;

  return (
    <div className="divide-y divide-white/5">
      {disputes.map((d: any) => (
        <div key={d.id} className="px-8 py-6 hover:bg-white/2 transition-colors">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-start justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-white">{d.booking?.event?.name ?? d.bookingId?.slice(0, 8)}</p>
              <p className="text-[11px] text-white/40">{d.booking?.user?.name ?? '—'} · {d.booking?.user?.email ?? '—'}</p>
              <p className="text-[11px] text-white/30">Raised {fmt(d.createdAt)}</p>
              {d.failureReason && (
                <p className="text-[11px] text-orange-400/80 mt-1">Reason: {d.failureReason}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <span className="text-lg font-bold text-white">{money(d.amount)}</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-400/10 text-orange-400 border border-orange-400/20">
                {d.status}
              </span>
            </div>
          </div>

          {!d.resolved && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                value={notes[d.id] ?? ''}
                onChange={e => setNotes(n => ({ ...n, [d.id]: e.target.value }))}
                placeholder="Admin notes (optional)…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/20"
              />
              <button
                onClick={() => resolve.mutate({ id: d.id, action: 'approve', adminNotes: notes[d.id] })}
                disabled={resolve.isPending}
                className="px-5 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold hover:bg-green-500/30 transition-colors disabled:opacity-40"
              >
                Approve Refund
              </button>
              <button
                onClick={() => resolve.mutate({ id: d.id, action: 'reject', adminNotes: notes[d.id] })}
                disabled={resolve.isPending}
                className="px-5 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-colors disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          )}

          {d.resolved && (
            <div className="mt-3 text-[11px] text-white/30">
              Resolved {fmt(d.resolvedAt)} {d.adminNotes ? `· "${d.adminNotes}"` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Booking Disputes tab (shared for asset + service) ─────────────────────────

function BookingDisputesTab({ type }: { type: 'asset' | 'service' }) {
  const qc = useQueryClient();
  const endpoint = type === 'asset' ? '/admin/asset-bookings/disputes' : '/admin/service-bookings/disputes';
  const resolveEndpoint = (id: string) =>
    type === 'asset' ? `/admin/asset-bookings/${id}/resolve` : `/admin/service-bookings/${id}/resolve`;

  const { data: bookings = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin', 'disputes', type],
    queryFn: () => api.get(endpoint).then(r => r.data.data),
  });

  const resolve = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: 'completed' | 'cancelled' }) =>
      api.patch(resolveEndpoint(id), { resolution }),
    onSuccess: () => {
      toast.success('Booking resolved');
      qc.invalidateQueries({ queryKey: ['admin', 'disputes', type] });
    },
    onError: () => toast.error('Failed to resolve booking'),
  });

  if (isLoading) return <div className="py-16 text-center text-white/30 text-sm">Loading…</div>;
  if (!bookings.length) return <Empty label={`No disputed ${type} bookings.`} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            {[type === 'asset' ? 'Asset' : 'Service', 'Client', 'Date', 'Amount', 'Actions'].map(h => (
              <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b: any) => (
            <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                <p className="font-bold text-white text-xs">{b[type]?.name ?? '—'}</p>
                <p className="text-[10px] text-white/30">{b[type]?.category ?? ''}</p>
              </td>
              <td className="py-3 px-4 text-xs text-white/60">{b.user?.name ?? b.userId?.slice(0, 8)}</td>
              <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">
                {fmt(type === 'asset' ? b.startDate : b.scheduledDate)}
              </td>
              <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(b.totalAmount)}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => resolve.mutate({ id: b.id, resolution: 'completed' })}
                    disabled={resolve.isPending}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold hover:bg-green-500/30 transition-colors disabled:opacity-40"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => resolve.mutate({ id: b.id, resolution: 'cancelled' })}
                    disabled={resolve.isPending}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/30 transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'refunds',  label: 'Refund Disputes',  icon: 'receipt_long',  color: 'text-orange-400' },
  { key: 'assets',   label: 'Asset Bookings',   icon: 'inventory_2',   color: 'text-purple-400' },
  { key: 'services', label: 'Service Bookings', icon: 'build',         color: 'text-blue-400'   },
] as const;

export const AdminDisputesPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refunds' | 'assets' | 'services'>('refunds');

  return (
    <section className="bg-surface-highlight/20 border border-white/5 rounded-[2rem] overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-400 text-2xl">gavel</span>
          <div>
            <h2 className="text-xl font-display font-bold text-white">Dispute Resolution</h2>
            <p className="text-xs text-white/30 mt-0.5">Review and resolve disputed bookings and refund requests</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span className={`material-symbols-outlined text-[15px] ${activeTab === tab.key ? tab.color : ''}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'refunds'  && <RefundDisputesTab />}
        {activeTab === 'assets'   && <BookingDisputesTab type="asset" />}
        {activeTab === 'services' && <BookingDisputesTab type="service" />}
      </div>
    </section>
  );
};

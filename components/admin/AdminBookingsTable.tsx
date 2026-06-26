'use client';

import React, { useState } from 'react';

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-green-400/10 text-green-400 border-green-400/20',
  pending:   'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  active:    'bg-blue-400/10 text-blue-400 border-blue-400/20',
  completed: 'bg-white/5 text-white/40 border-white/10',
  cancelled: 'bg-red-400/10 text-red-400/70 border-red-400/20',
  disputed:  'bg-orange-400/10 text-orange-400 border-orange-400/20',
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? 'pending';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLE[s] ?? STATUS_STYLE.pending}`}>
      {s}
    </span>
  );
}

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function money(n: number) {
  return `₱${Number(n ?? 0).toLocaleString()}`;
}

// ── Service Bookings tab ──────────────────────────────────────────────────────
function ServiceBookingsTab({ rows }: { rows: any[] }) {
  if (!rows.length) return <Empty label="No service bookings yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            {['Service', 'Client', 'Scheduled Date', 'Location', 'Guests', 'Amount', 'Status'].map(h => (
              <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((b: any) => (
            <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                <p className="font-bold text-white text-xs">{b.service?.name ?? '—'}</p>
                <p className="text-[10px] text-white/30">{b.service?.category ?? ''}</p>
              </td>
              <td className="py-3 px-4 text-xs text-white/60">{b.user?.name ?? b.userId?.slice(0, 8)}</td>
              <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">{fmt(b.scheduledDate)}</td>
              <td className="py-3 px-4 text-xs text-white/60 max-w-[140px] truncate">{b.location ?? '—'}</td>
              <td className="py-3 px-4 text-xs text-white/60">{b.guestCount ?? '—'}</td>
              <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(b.totalAmount)}</td>
              <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Asset / Gear Bookings tab ─────────────────────────────────────────────────
function AssetBookingsTab({ rows }: { rows: any[] }) {
  if (!rows.length) return <Empty label="No gear bookings yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            {['Asset', 'Client', 'Pickup', 'Return', 'Qty', 'Fulfillment', 'Amount', 'Status'].map(h => (
              <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((b: any) => (
            <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                <p className="font-bold text-white text-xs">{b.asset?.name ?? '—'}</p>
                <p className="text-[10px] text-white/30">{b.asset?.category ?? ''}</p>
              </td>
              <td className="py-3 px-4 text-xs text-white/60">{b.user?.name ?? b.userId?.slice(0, 8)}</td>
              <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">{fmt(b.startDate)}</td>
              <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">{fmt(b.endDate)}</td>
              <td className="py-3 px-4 text-xs text-white/60">{b.quantity ?? 1}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.fulfillmentType === 'delivery' ? 'bg-purple-400/10 text-purple-400' : 'bg-white/5 text-white/40'}`}>
                  {b.fulfillmentType ?? '—'}
                </span>
              </td>
              <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(b.totalAmount)}</td>
              <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Event Bookings tab ────────────────────────────────────────────────────────
function EventBookingsTab({ rows }: { rows: any[] }) {
  if (!rows.length) return <Empty label="No event bookings yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            {['Event / Package', 'Client', 'Date', 'Guests', 'Amount', 'Status'].map(h => (
              <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((b: any) => (
            <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                <p className="font-bold text-white text-xs">{b.event?.name ?? '—'}</p>
                <p className="text-[10px] text-white/30 capitalize">{b.event?.eventCategory ?? ''}</p>
              </td>
              <td className="py-3 px-4 text-xs text-white/60">{b.user?.name ?? b.userId?.slice(0, 8)}</td>
              <td className="py-3 px-4 text-xs text-white/60 whitespace-nowrap">{fmt(b.startAt)}</td>
              <td className="py-3 px-4 text-xs text-white/60">{b.guestCount ?? '—'}</td>
              <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(b.totalAmount)}</td>
              <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-white/20">
      <span className="material-symbols-outlined text-[48px]">inbox</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  serviceBookings: any[];
  assetBookings: any[];
  eventBookings: any[];
}

const TABS = [
  { key: 'service', label: 'Services',  icon: 'build',              color: 'text-orange-400' },
  { key: 'asset',   label: 'Gears',     icon: 'inventory_2',        color: 'text-purple-400' },
  { key: 'event',   label: 'Events',    icon: 'confirmation_number', color: 'text-accent'     },
] as const;

export const AdminBookingsTable: React.FC<Props> = ({ serviceBookings, assetBookings, eventBookings }) => {
  const [activeTab, setActiveTab] = useState<'service' | 'asset' | 'event'>('service');

  const counts = { service: serviceBookings.length, asset: assetBookings.length, event: eventBookings.length };
  const total = counts.service + counts.asset + counts.event;

  return (
    <section className="bg-surface-highlight/20 border border-white/5 rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-accent text-2xl">confirmation_number</span>
          <div>
            <h2 className="text-xl font-display font-bold text-white">All Bookings</h2>
            <p className="text-xs text-white/30 mt-0.5">{total} total across services, gears &amp; events</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span className={`material-symbols-outlined text-[15px] ${activeTab === tab.key ? tab.color : ''}`}>{tab.icon}</span>
              {tab.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.key ? 'bg-white/15 text-white' : 'bg-white/5 text-white/30'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table body */}
      <div className="min-h-[200px]">
        {activeTab === 'service' && <ServiceBookingsTab rows={serviceBookings} />}
        {activeTab === 'asset'   && <AssetBookingsTab   rows={assetBookings}   />}
        {activeTab === 'event'   && <EventBookingsTab   rows={eventBookings}   />}
      </div>
    </section>
  );
};

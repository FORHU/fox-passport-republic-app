'use client';

import React from 'react';
import Link from 'next/link';
import { useClientMatchRequests } from '@/features/gamification/hooks/usePassport';
import type { ClientMatchRequest } from '@/features/gamification/api/passport';

export function OccupancyChart() {
  return (
    <div className="lg:col-span-8 bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-[2rem] p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-display font-bold mb-1">Occupancy</h3>
          <p className="text-xs text-white/40">Capacity usage</p>
        </div>
        <select className="bg-black/40 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5">
          <option>7 Days</option>
          <option>30 Days</option>
        </select>
      </div>
      <div className="flex items-center justify-center text-white/20 text-sm" style={{ height: '160px' }}>
        No occupancy data yet
      </div>
    </div>
  );
}

function statusColor(s: string) {
  if (s === 'approved') return '#22c55e';
  if (s === 'rejected') return '#ef4444';
  return '#f97316';
}

export function PendingRequests() {
  const { data: page, isLoading } = useClientMatchRequests(0, true);
  const requests: ClientMatchRequest[] = page?.data ?? [];
  const pendingOnly = requests.filter(r => r.requestStatus === 'pending').slice(0, 4);
  const totalPending = requests.filter(r => r.requestStatus === 'pending').length;

  return (
    <div className="lg:col-span-4 bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-[2rem] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-lg">Pending</h3>
          {totalPending > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#ff00aa] text-white text-[9px] font-black">
              {totalPending}
            </span>
          )}
        </div>
        <button className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black">
          <span className="material-symbols-outlined text-[14px]">more_horiz</span>
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-white/20 text-xs">Loading…</div>
        ) : pendingOnly.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-3xl text-white/10 mb-2">inbox</span>
            <p className="text-xs text-white/20">No pending requests</p>
          </div>
        ) : pendingOnly.map((req) => (
          <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 shrink-0 overflow-hidden">
              {req.client?.imgId
                ? <img src={`https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${req.client.imgId}`} className="h-full w-full object-cover" alt="" />
                : (req.client?.name?.charAt(0) ?? '?')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{req.client?.name}</p>
              <p className="text-[10px] text-white/40 truncate">
                {req.guestCount} guests · {new Date(req.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              {req.template && (
                <p className="text-[10px] text-[#ccff00]/60 truncate">{req.template.name}</p>
              )}
            </div>
            <span
              className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
              style={{ color: statusColor(req.requestStatus), borderColor: `${statusColor(req.requestStatus)}40`, backgroundColor: `${statusColor(req.requestStatus)}10` }}
            >
              {req.requestStatus}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/user/passport"
        className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest text-center block"
      >
        View All
      </Link>
    </div>
  );
}

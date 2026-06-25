'use client';

import React from 'react';
import { OCCUPANCY_DATA, PENDING_REQUESTS } from '@/data/dashboardData';

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
      <div className="flex items-end justify-between gap-3" style={{ height: '160px' }}>
        {OCCUPANCY_DATA.map((x, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${x.h}px`,
                background: x.a
                  ? 'linear-gradient(to top, rgba(219,39,119,0.5), rgba(219,39,119,0.9))'
                  : 'linear-gradient(to top, rgba(124,58,237,0.4), rgba(124,58,237,0.7))',
              }}
            />
            <span className="text-[10px] text-white/40 font-bold">{x.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PendingRequests() {
  return (
    <div className="lg:col-span-4 bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-[2rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-lg">Pending</h3>
        <button className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black">
          <span className="material-symbols-outlined text-[14px]">more_horiz</span>
        </button>
      </div>
      <div className="space-y-3">
        {PENDING_REQUESTS.map((req) => (
          <div key={req.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
            <img className="h-10 w-10 rounded-full border border-white/10" src={req.avatar} alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="text-sm font-bold">{req.name}</p>
                <span className="text-[10px] text-white/40">{req.time}</span>
              </div>
              <p className="text-xs text-white/40">
                Req: <span className="text-[#ccff00]">{req.request}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </button>
              <button className="h-7 w-7 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest">
        View All
      </button>
    </div>
  );
}

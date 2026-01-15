'use client';

import React from 'react';
import { VenueItem } from '@/data/dashboardData';
import { StatusBadge } from './StatusBadge';

interface VenuesSectionProps {
  venues: VenueItem[];
  onStatusChange: (id: number, status: string) => void;
}

export function VenuesSection({ venues, onStatusChange }: VenuesSectionProps) {
  return (
    <section id="venues">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-pink-500">apartment</span>
          My Venues
        </h2>
        <a
          className="text-xs font-bold text-[#ccff00] border border-[#ccff00]/30 px-4 py-2 rounded-full hover:bg-[#ccff00] hover:text-black transition-all flex items-center gap-1"
          href="#"
        >
          View All
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
      <div className="space-y-4">
        {venues.map((vn) => (
          <div
            key={vn.id}
            className={`bg-[#0f111a]/60 backdrop-blur border border-white/5 p-5 rounded-3xl hover:bg-white/5 transition-all group border-l-4 ${
              vn.status === 'Published' ? 'border-l-green-500' : 'border-l-yellow-500'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative w-full sm:w-36 aspect-video sm:aspect-square rounded-2xl overflow-hidden shrink-0">
                <img
                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                    vn.status !== 'Published' ? 'grayscale group-hover:grayscale-0' : ''
                  }`}
                  src={vn.img}
                  alt=""
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase">
                  {vn.type}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{vn.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {vn.loc}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        {vn.cap}
                      </span>
                    </div>
                  </div>
                  <StatusBadge
                    currentStatus={vn.status}
                    type="venue"
                    onStatusChange={(s) => onStatusChange(vn.id, s)}
                  />
                </div>
                {vn.status === 'Published' ? (
                  <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase">Bookings</div>
                      <div className="text-sm font-bold">{vn.bookings}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase">Revenue</div>
                      <div className="text-sm font-bold">{vn.revenue}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="h-9 w-9 rounded-full bg-white/5 hover:bg-white hover:text-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="h-9 w-9 rounded-full bg-white/5 hover:bg-[#ccff00] hover:text-black flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 text-pink-400">
                      <span className="material-symbols-outlined text-[18px]">engineering</span>
                      <span className="text-xs">Renovation in progress</span>
                    </div>
                    <button className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white hover:text-black">
                      Manage Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

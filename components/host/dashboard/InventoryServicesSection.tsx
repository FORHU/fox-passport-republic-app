'use client';

import React from 'react';
import { InventoryItem, ServiceItem } from '@/data/dashboardData';
import { StatusBadge } from './StatusBadge';

interface InventorySectionProps {
  inventory: InventoryItem[];
  onStatusChange: (id: number, status: string) => void;
}

export function InventorySection({ inventory, onStatusChange }: InventorySectionProps) {
  return (
    <section id="inventory">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-500">inventory_2</span>
          Inventories
        </h2>
        <button className="text-xs font-bold text-[#ccff00] border border-[#ccff00]/30 px-4 py-2 rounded-full hover:bg-[#ccff00] hover:text-black flex items-center gap-1">
          View All
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inventory.map((it) => (
          <div
            key={it.id}
            className="relative bg-[#0f111a]/60 border border-white/5 rounded-2xl group hover:border-purple-500/50 transition-all overflow-hidden"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={it.img}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt=""
              />
            </div>
            <div className="absolute top-3 left-3 z-10">
              <StatusBadge
                currentStatus={it.status}
                type="inventory"
                onStatusChange={(s) => onStatusChange(it.id, s)}
              />
            </div>
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
              <h4 className="font-bold text-sm">{it.name}</h4>
              <p className="text-[10px] text-white/50 uppercase">{it.cat}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface ServicesSectionProps {
  services: ServiceItem[];
  onStatusChange: (id: number, status: string) => void;
}

export function ServicesSection({ services, onStatusChange }: ServicesSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400">handyman</span>
          Services
        </h2>
        <button className="text-xs font-bold text-[#ccff00] border border-[#ccff00]/30 px-4 py-2 rounded-full hover:bg-[#ccff00] hover:text-black flex items-center gap-1">
          View All
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
      <div className="space-y-3">
        {services.map((sv) => (
          <div
            key={sv.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#0f111a]/60 border border-white/5 hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${sv.color}`}>
                <span className="material-symbols-outlined">{sv.icon}</span>
              </div>
              <div>
                <h4 className={`font-bold ${sv.status === 'Active' ? 'text-white' : 'text-white/50'}`}>
                  {sv.name}
                </h4>
                <p className="text-xs text-white/40">{sv.price}</p>
              </div>
            </div>
            <StatusBadge
              currentStatus={sv.status}
              type="service"
              onStatusChange={(s) => onStatusChange(sv.id, s)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

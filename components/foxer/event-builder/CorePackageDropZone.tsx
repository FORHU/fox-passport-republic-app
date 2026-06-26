'use client';

import React from 'react';
import { ResourceItem } from '@/data/eventBuilderData';

interface CorePackageDropZoneProps {
  baseItems: ResourceItem[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, patch: Partial<Pick<ResourceItem, 'agreedPrice' | 'isOptional'>>) => void;
}

export function CorePackageDropZone({
  baseItems,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveItem,
  onUpdateItem,
}: CorePackageDropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`min-h-[160px] rounded-[2rem] border-2 border-dashed transition-all p-8 relative ${
        isDragOver ? 'border-accent bg-accent/5' : 'border-white/10 bg-[#0f111a]/30'
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">package_2</span>
            Core Package
          </h3>
          <p className="text-xs text-text-muted">Set an agreed price and mark items as optional for clients.</p>
        </div>
        <span className="bg-white/5 text-white/70 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
          {baseItems.length}
        </span>
      </div>

      {baseItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-20 text-text-muted pointer-events-none">
          <span className="material-symbols-outlined text-3xl mb-2 opacity-30">
            add_circle_outline
          </span>
          <p className="text-sm opacity-50">Drop venues, talent, services here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {baseItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="bg-[#1a1d2d] border border-white/5 rounded-xl p-3"
            >
              {/* Top row: icon + name + delete */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-[10px] text-text-muted">Listing price: ₱{item.cost.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-white/20 hover:text-red-400 p-1.5 rounded-full"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>

              {/* Bottom row: agreed price + optional toggle */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className="flex-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">
                    Agreed Price (₱)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={String(item.cost)}
                    value={item.agreedPrice ?? ''}
                    onChange={(e) =>
                      onUpdateItem(item.id, { agreedPrice: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div className="shrink-0 pt-4">
                  <button
                    type="button"
                    onClick={() => onUpdateItem(item.id, { isOptional: !item.isOptional })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      item.isOptional
                        ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                        : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {item.isOptional ? 'toggle_on' : 'toggle_off'}
                    </span>
                    Optional
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

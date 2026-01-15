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
}

export function CorePackageDropZone({
  baseItems,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveItem,
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
          <p className="text-xs text-text-muted">Included in base price.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {baseItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="bg-[#1a1d2d] border border-white/5 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{item.name}</p>
                  <p className="text-[10px] text-text-muted">₱{item.cost.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-white/20 hover:text-red-400 p-1.5 rounded-full"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { ResourceItem } from '@/data/eventBuilderData';

interface ResourceCardProps {
  item: ResourceItem;
  onDragStart: (e: React.DragEvent, item: ResourceItem) => void;
}

export function ResourceCard({ item, onDragStart }: ResourceCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="group bg-[#161b26] hover:bg-[#1c2230] border border-white/5 hover:border-white/10 rounded-2xl p-4 cursor-grab"
    >
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center text-white/50 shrink-0">
          <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white text-sm truncate pr-2">{item.name}</h4>
            <span className="text-xs text-accent font-bold font-mono">
              ₱{item.cost.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}

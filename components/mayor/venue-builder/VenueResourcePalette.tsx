'use client';

import React from 'react';
import { RESOURCE_CATEGORIES, ResourceItem } from '@/data/venueBuilderData';

interface VenueResourcePaletteProps {
  activeCategory: string;
  searchQuery: string;
  filteredResources: ResourceItem[];
  showCustomForm: boolean;
  newItem: { name: string; value: string; desc: string };
  currentCategoryLabel: string;
  onCategoryChange: (catId: string) => void;
  onSearchChange: (query: string) => void;
  onShowCustomForm: (show: boolean) => void;
  onNewItemChange: (item: { name: string; value: string; desc: string }) => void;
  onAddCustomItem: () => void;
  onDragStart: (e: React.DragEvent, item: ResourceItem) => void;
}

export function VenueResourcePalette({
  activeCategory,
  searchQuery,
  filteredResources,
  showCustomForm,
  newItem,
  currentCategoryLabel,
  onCategoryChange,
  onSearchChange,
  onShowCustomForm,
  onNewItemChange,
  onAddCustomItem,
  onDragStart,
}: VenueResourcePaletteProps) {
  return (
    <>
      {/* Category Navigation */}
      <nav className="w-24 shrink-0 bg-[#0f111a] border-r border-white/5 flex flex-col items-center py-6 gap-6 overflow-y-auto hide-scrollbar z-20">
        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
              activeCategory === cat.id
                ? 'bg-accent text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.4)] scale-105'
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[28px] mb-1">{cat.icon}</span>
            <span className="text-[9px] uppercase tracking-wider">{cat.label}</span>
          </button>
        ))}
      </nav>

      {/* Resource List */}
      <aside className="w-80 shrink-0 border-r border-white/5 bg-[#0f111a] flex flex-col relative z-10">
        <div className="p-6">
          <h3 className="font-display font-bold text-lg text-white mb-1">{currentCategoryLabel}</h3>
          <p className="text-xs text-text-muted">Drag features to your venue</p>
        </div>
        
        <div className="px-6 pb-4 space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1a1d2d] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-accent outline-none placeholder:text-white/20"
            />
          </div>
          
          {!showCustomForm ? (
            <button
              onClick={() => onShowCustomForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-white/20 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:border-accent flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Custom
            </button>
          ) : (
            <div className="bg-[#1a1d2d] border border-white/10 rounded-xl p-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-accent uppercase">New {activeCategory}</span>
                <button onClick={() => onShowCustomForm(false)} className="text-text-muted hover:text-white">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) => onNewItemChange({ ...newItem, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-accent outline-none"
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={newItem.value}
                  onChange={(e) => onNewItemChange({ ...newItem, value: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-accent outline-none"
                />
                <button
                  onClick={onAddCustomItem}
                  disabled={!newItem.name}
                  className="w-full bg-accent text-black font-bold text-xs py-2 rounded-lg disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {filteredResources.map((item) => (
            <div
              key={item.id}
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
                      ₱{item.value.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

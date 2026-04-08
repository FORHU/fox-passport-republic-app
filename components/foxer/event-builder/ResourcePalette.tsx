import React from 'react';
import { RESOURCE_CATEGORIES, ResourceItem } from '@/data/eventBuilderData';
import { ResourceCard } from './ResourceCard';

interface ResourcePaletteProps {
  activeCategory: string;
  searchQuery: string;
  filteredResources: ResourceItem[];
  onCategoryChange: (catId: string) => void;
  onSearchChange: (query: string) => void;
  onDragStart: (e: React.DragEvent, item: ResourceItem) => void;
}

export function ResourcePalette({
  activeCategory,
  searchQuery,
  filteredResources,
  onCategoryChange,
  onSearchChange,
  onDragStart,
}: ResourcePaletteProps) {
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
          <h3 className="font-display font-bold text-xl text-white mb-1">
            {RESOURCE_CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h3>
          <p className="text-xs text-text-muted">Drag items to the canvas</p>
        </div>
        
        <div className="px-6 pb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1a1d2d] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-accent outline-none placeholder:text-white/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {filteredResources.map((item) => (
            <ResourceCard key={item.id} item={item} onDragStart={onDragStart} />
          ))}
        </div>
      </aside>
    </>
  );
}

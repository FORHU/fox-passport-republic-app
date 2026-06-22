'use client';

import React from 'react';
import { RESOURCE_CATEGORIES, ResourceItem } from '@/features/venue/data/venueBuilderData';

interface VenueResourcePaletteProps {
  activeCategory: string;
  searchQuery: string;
  filteredResources: ResourceItem[];
  newItem: { name: string; value: string; desc: string; image?: string; file?: File };
  currentCategoryLabel: string;
  onCategoryChange: (catId: string) => void;
  onSearchChange: (query: string) => void;
  onNewItemChange: (item: { name: string; value: string; desc: string; image?: string; file?: File }) => void;
  onAddCustomItem: () => void;
  onRemoveResource: (category: string, id: string) => void;
  onDragStart: (e: React.DragEvent, item: ResourceItem) => void;
}

export function VenueResourcePalette({
  activeCategory,
  searchQuery,
  filteredResources,
  newItem,
  currentCategoryLabel,
  onCategoryChange,
  onSearchChange,
  onNewItemChange,
  onAddCustomItem,
  onRemoveResource,
  onDragStart,
}: VenueResourcePaletteProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onNewItemChange({ ...newItem, file, image: url });
    }
  };

  const removePhoto = () => {
    if (newItem.image) URL.revokeObjectURL(newItem.image);
    onNewItemChange({ ...newItem, file: undefined, image: '' });
  };

  return (
    <>
      {/* Category Navigation */}
      <nav className="w-24 shrink-0 bg-[#0f111a] border-r border-white/5 flex flex-col items-center py-6 gap-6 overflow-y-auto hide-scrollbar z-20">
        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${activeCategory === cat.id
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
        <div className="p-6 pb-2">
          <h3 className="font-display font-bold text-lg text-white mb-1">{currentCategoryLabel}</h3>
          <p className="text-xs text-text-muted">Drag features to your venue</p>
        </div>

        <div className="px-6 pb-4 space-y-4 pt-2">
          <div className="bg-[#1a1d2d] border border-white/10 rounded-xl p-4 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Add {currentCategoryLabel} Item</span>
            </div>
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-3">
                {/* Photo Upload Area - Hidden for Staffing and Policies */}
                {activeCategory !== 'staff' && activeCategory !== 'rules' && (
                  <div className="relative group shrink-0">
                    {newItem.image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={newItem.image} alt="preview" className="w-full h-full object-cover" />
                        <button
                          onClick={removePhoto}
                          className="absolute top-0 right-0 p-0.5 bg-black/60 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20 hover:text-accent hover:border-accent/40 bg-black/20 transition-all group"
                      >
                        <span className="material-symbols-outlined text-lg">add_a_photo</span>
                        <span className="text-[8px] uppercase font-bold mt-1">Photo</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-white/40 font-bold ml-1">Name</label>
                    <input
                      type="text"
                      placeholder={activeCategory === 'staff' ? "e.g. Concierge" : activeCategory === 'rules' ? "e.g. No Smoking" : "e.g. Deluxe Room"}
                      value={newItem.name}
                      onChange={(e) => onNewItemChange({ ...newItem, name: e.target.value })}
                      className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-accent outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {activeCategory !== 'rules' && (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-white/40 font-bold ml-1">Value (₱)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItem.value}
                    onChange={(e) => onNewItemChange({ ...newItem, value: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-accent outline-none transition-colors"
                  />
                </div>
              )}
              <button
                onClick={onAddCustomItem}
                disabled={!newItem.name}
                className="w-full bg-accent text-black font-bold text-xs py-2.5 rounded-lg disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] mt-2 shadow-[0_4px_15px_rgba(204,255,0,0.2)]"
              >
                Add to List
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#1a1d2d]/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-accent outline-none placeholder:text-white/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
          {filteredResources.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="group bg-[#161b26] hover:bg-[#1c2230] border border-white/5 hover:border-white/10 rounded-2xl p-4 cursor-grab relative"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-white/30">{item.icon}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm truncate pr-2">{item.name}</h4>
                    <div className="flex flex-row items-center gap-2">
                      {item.category !== 'rules' && (
                        <span className="text-xs text-accent font-bold font-mono">
                          ₱{item.value.toLocaleString()}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveResource(activeCategory, item.id);
                        }}
                        className="text-white/20 hover:text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
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

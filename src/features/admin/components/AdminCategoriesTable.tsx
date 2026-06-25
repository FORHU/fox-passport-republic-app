'use client';

import React, { useState } from 'react';

interface CategorySummary {
  name: string;
  count: number;
  isEventCategory: boolean;
  sources: {
    assets: number;
    venues: number;
    services: number;
    events: number;
  };
}

interface CategoriesTableProps {
  categories: CategorySummary[];
  isLoading: boolean;
}

function fmtName(raw: string) {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const SOURCE_ICONS: { key: keyof CategorySummary['sources']; icon: string; label: string; color: string }[] = [
  { key: 'events',   icon: 'confirmation_number', label: 'Events',   color: 'text-accent'     },
  { key: 'venues',   icon: 'storefront',           label: 'Venues',   color: 'text-blue-400'   },
  { key: 'assets',   icon: 'inventory_2',          label: 'Assets',   color: 'text-purple-400' },
  { key: 'services', icon: 'build',                label: 'Services', color: 'text-orange-400' },
];

const CATEGORY_ICONS: Record<string, string> = {
  birthday: 'cake', wedding: 'favorite', corporate: 'business_center', social: 'groups',
  other: 'more_horiz', entertainment: 'music_note', catering: 'restaurant', design: 'palette',
  service_staff: 'support_agent', indoor: 'home', outdoor: 'park', beach_resort: 'beach_access',
  garden: 'local_florist', hotel: 'hotel', mix: 'shuffle', furnitures: 'chair',
  sound_system: 'speaker', decorations: 'celebration', photography: 'camera_alt',
  videography: 'videocam', planning: 'event_note',
};

export const AdminCategoriesTable: React.FC<CategoriesTableProps> = ({ categories, isLoading }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'event' | 'listing'>('all');

  if (isLoading) {
    return (
      <div className="glass-panel rounded-[2rem] p-12 flex items-center justify-center border border-white/5">
        <span className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const filtered = categories.filter(cat => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase()) ||
      fmtName(cat.name).toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'event' ? cat.isEventCategory :
      !cat.isEventCategory;
    return matchSearch && matchFilter;
  });

  const totalListings = categories.reduce((s, c) => s + c.count, 0);
  const eventCats = categories.filter(c => c.isEventCategory).length;
  const listingCats = categories.filter(c => !c.isEventCategory).length;

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Platform Categories</h2>
          <p className="text-xs text-white/30 mt-0.5">
            {categories.length} total · {totalListings} listings across all types
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter chips */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
            {(['all', 'event', 'listing'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {f === 'all' ? `All (${categories.length})` : f === 'event' ? `Events (${eventCats})` : `Listings (${listingCats})`}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[16px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/50 w-44"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
        {SOURCE_ICONS.map(src => {
          const total = categories.reduce((s, c) => s + c.sources[src.key], 0);
          return (
            <div key={src.key} className="px-6 py-4 flex items-center gap-3">
              <span className={`material-symbols-outlined text-[20px] ${src.color}`}>{src.icon}</span>
              <div>
                <p className="text-lg font-bold text-white font-display">{total}</p>
                <p className="text-[10px] text-white/30">{src.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              {['Category', 'Type', 'Used in Events', 'Used in Venues', 'Used in Assets', 'Used in Services', 'Total'].map(h => (
                <th key={h} className="py-3 px-5 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-white/20 text-sm">
                  No categories match your filter.
                </td>
              </tr>
            ) : (
              filtered.map(cat => {
                const icon = CATEGORY_ICONS[cat.name] ?? 'label';
                return (
                  <tr key={cat.name} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                    {/* Name */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cat.isEventCategory ? 'bg-accent/10 text-accent' : 'bg-white/5 text-white/50'}`}>
                          <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{fmtName(cat.name)}</p>
                          <p className="text-[10px] text-white/30 font-mono">{cat.name}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type badge */}
                    <td className="py-3 px-5">
                      {cat.isEventCategory ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                          <span className="material-symbols-outlined text-[12px]">confirmation_number</span>
                          Event
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-white/5 text-white/40 border border-white/10">
                          <span className="material-symbols-outlined text-[12px]">inventory</span>
                          Listing
                        </span>
                      )}
                    </td>
                    {/* Source counts */}
                    {SOURCE_ICONS.map(src => (
                      <td key={src.key} className="py-3 px-5">
                        {cat.sources[src.key] > 0 ? (
                          <span className={`font-bold text-xs ${src.color}`}>{cat.sources[src.key]}</span>
                        ) : (
                          <span className="text-white/15 text-xs">—</span>
                        )}
                      </td>
                    ))}
                    {/* Total */}
                    <td className="py-3 px-5">
                      <span className={`text-sm font-bold ${cat.count > 0 ? 'text-white' : 'text-white/20'}`}>
                        {cat.count || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

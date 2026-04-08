import React from 'react';
import {
  CategoryItem,
  CONDITIONS,
  INVENTORY_UNITS,
  ListingType,
} from '@/data/listingBuilderData';
import { SERVICE_UNITS } from '@/data/serviceBuilderData';

interface ListingSidebarProps {
  activeType: ListingType;
  categories: CategoryItem[];
  currentStatuses: readonly string[];
  category: string;
  customCategory: string;
  condition: string;
  price: number;
  unit: string;
  status: string;
  onCategorySelect: (catId: string) => void;
  onCustomCategoryChange: (cat: string) => void;
  onConditionChange: (cond: string) => void;
  onPriceChange: (price: number) => void;
  onUnitChange: (unit: string) => void;
  onStatusChange: (status: string) => void;
}

export function ListingSidebar({
  activeType,
  categories,
  currentStatuses,
  category,
  customCategory,
  condition,
  price,
  unit,
  status,
  onCategorySelect,
  onCustomCategoryChange,
  onConditionChange,
  onPriceChange,
  onUnitChange,
  onStatusChange,
}: ListingSidebarProps) {
  const units = activeType === 'inventory' ? INVENTORY_UNITS : SERVICE_UNITS;

  return (
    <aside className="w-80 shrink-0 border-r border-white/5 bg-[#0f111a] flex flex-col relative z-10">
      <div className="p-6 border-b border-white/5">
        <h3 className="font-display font-bold text-lg text-white mb-1">Details</h3>
        <p className="text-xs text-text-muted">Define your {activeType}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Category Selection */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-3 block">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  category === cat.id
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-white/10 bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                <span className="text-[10px] font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
          {category === 'other' && (
            <div className="mt-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1.5 block">
                Specify Category
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => onCustomCategoryChange(e.target.value)}
                placeholder={activeType === 'inventory' ? 'e.g. Vintage Camera' : 'e.g. Makeup Artist'}
                autoFocus
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Condition (Inventory only) */}
        {activeType === 'inventory' && (
          <div>
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-3 block">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  onClick={() => onConditionChange(cond)}
                  className={`px-4 py-2 rounded-lg border text-xs font-bold capitalize transition-all ${
                    condition === cond
                      ? 'border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00]'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Pricing */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-3 block">
            Base Pricing
          </label>
          <div className="space-y-3">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-white/30 text-sm">₱</span>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-10 pr-16 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none font-mono transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-2 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => onPriceChange(price + 100)}
                  className="h-4 w-6 rounded bg-white/10 flex items-center justify-center text-white/50 hover:bg-[#ccff00]/20 hover:text-[#ccff00] transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">expand_less</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPriceChange(Math.max(0, price - 100))}
                  className="h-4 w-6 rounded bg-white/10 flex items-center justify-center text-white/50 hover:bg-[#ccff00]/20 hover:text-[#ccff00] transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">expand_more</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => onUnitChange(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none appearance-none cursor-pointer transition-colors"
                style={{ colorScheme: 'dark' }}
              >
                {(units as readonly string[]).map((u) => (
                  <option key={u} value={u} className="bg-[#0f111a]">
                    {u}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-3 block">
            Initial Status
          </label>
          <div className="space-y-2">
            {currentStatuses.map((s) => (
              <label
                key={s}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  status === s
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium capitalize text-white">{s}</span>
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    status === s
                      ? 'border-[#00bfff] bg-[#00bfff]'
                      : 'border-white/30 bg-transparent'
                  }`}
                >
                  {status === s && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name="status"
                  className="sr-only"
                  checked={status === s}
                  onChange={() => onStatusChange(s)}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

import React from 'react';
import { CategoryItem, ListingType } from '@/data/listingBuilderData';

interface ListingStatusPanelProps {
  activeType: ListingType;
  categories: CategoryItem[];
  category: string;
  customCategory: string;
  condition: string;
  price: number;
  unit: string;
  completionPercentage: number;
  isReadyToPublish: boolean;
}

export function ListingStatusPanel({
  activeType,
  categories,
  category,
  customCategory,
  condition,
  price,
  unit,
  completionPercentage,
  isReadyToPublish,
}: ListingStatusPanelProps) {
  const displayCategory =
    category === 'other' && customCategory
      ? customCategory
      : categories.find((c) => c.id === category)?.label || '-';

  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#0f111a] flex flex-col shadow-2xl z-10">
      <div className="p-6 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-lg">Listing Status</h3>
        <p className="text-xs text-text-muted">Review & Publish</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Completion */}
        <div className="bg-surface-highlight/30 rounded-xl p-4 border border-white/5">
          <h4 className="text-xs font-bold text-white mb-2">Completion</h4>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted">
            {isReadyToPublish ? 'Ready to publish' : 'Missing photo & fields'}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Type</span>
            <span className="text-white capitalize">{activeType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Category</span>
            <span className="text-white capitalize">{displayCategory}</span>
          </div>
          {activeType === 'inventory' && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Condition</span>
              <span className="text-white capitalize">{condition}</span>
            </div>
          )}
          <div className="h-px bg-white/10 w-full my-2" />
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-white">Listing Price</span>
            <div className="text-right">
              <span className="block text-lg font-bold text-accent font-mono">
                ₱{price.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-muted uppercase">{unit}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-[#0f111a]">
        <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all text-sm font-bold text-white">
          Preview Page
        </button>
      </div>
    </aside>
  );
}

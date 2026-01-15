'use client';

import React from 'react';
import { ResourceItem } from '@/data/eventBuilderData';

interface EventBlueprintProps {
  baseItems: ResourceItem[];
  targetMargin: number;
  baseCost: number;
  suggestedPrice: number;
  venueCost: number;
  talentCost: number;
  blueprintHealth: number;
  galleryCount: number;
  onMarginChange: (margin: number) => void;
}

export function EventBlueprint({
  baseItems,
  targetMargin,
  baseCost,
  suggestedPrice,
  venueCost,
  talentCost,
  blueprintHealth,
  galleryCount,
  onMarginChange,
}: EventBlueprintProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-white/5 bg-[#0f111a] flex flex-col shadow-2xl z-10">
      <div className="p-6 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-lg">Event Blueprint</h3>
        <p className="text-xs text-text-muted">Financial Overview</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Cost Breakdown */}
        <div>
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
            Cost Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Venue & Infrastructure</span>
              <span className="text-white font-mono">₱{venueCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Talent & Entertainment</span>
              <span className="text-white font-mono">₱{talentCost.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Total Base Cost</span>
              <span className="text-white font-mono">₱{baseCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Pricing Strategy */}
        <div className="bg-[#161b26] rounded-xl p-5 border border-white/5">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">price_check</span>
            Pricing Strategy
          </h4>
          <div className="mb-4">
            <label className="text-[10px] text-text-muted block mb-2">Target Margin (%)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={targetMargin}
                onChange={(e) => onMarginChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-accent font-bold font-mono w-8 text-right text-xs">
                {targetMargin}%
              </span>
            </div>
          </div>
          <div className="space-y-1 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Suggested Price</span>
              <span className="text-base font-bold text-white font-mono">
                ₱{suggestedPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Health */}
      <div className="p-6 border-t border-white/5 bg-[#0f111a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-black font-bold text-sm">
            {blueprintHealth}%
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Blueprint Health</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${blueprintHealth}%` }}
              />
            </div>
          </div>
        </div>
        <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all text-sm font-bold text-white">
          Preview Listing
        </button>
      </div>
    </aside>
  );
}

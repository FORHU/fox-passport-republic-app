"use client";

import React from "react";
import { BlueprintHealthItem } from "@/features/event/hooks/useEventBuilder";

interface EventBlueprintProps {
  targetMargin: number;
  baseCost: number;
  listingCost: number;
  suggestedPrice: number;
  venueCost: number;
  talentCost: number;
  serviceCost: number;
  blueprintHealth: {
    score: number;
    items: BlueprintHealthItem[];
    readyToPublish: boolean;
  };
  onMarginChange: (margin: number) => void;
  onPreview?: () => void;
  /** When true, panel is always visible (used inside a mobile drawer). */
  inDrawer?: boolean;
}

export function EventBlueprint({
  targetMargin,
  baseCost,
  listingCost,
  suggestedPrice,
  venueCost,
  talentCost,
  serviceCost,
  blueprintHealth,
  onMarginChange,
  onPreview,
  inDrawer = false,
}: EventBlueprintProps) {
  return (
    <aside
      className={`${inDrawer ? "flex w-full border-l-0" : "hidden md:flex w-80"} shrink-0 border-l border-white/5 bg-[#0f111a] flex-col shadow-2xl z-10`}
    >
      <div className="p-6 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-lg">
          Event Blueprint
        </h3>
        <p className="text-xs text-text-muted">Financial Overview</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Cost Breakdown */}
        <div>
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Cost Breakdown
          </h4>
          <p className="text-[10px] text-white/30 mb-4">
            Totals use your agreed price where you&apos;ve set one, otherwise
            the listing price.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Venue & Infrastructure</span>
              <span className="text-white font-mono">
                ₱{venueCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Talent & Entertainment</span>
              <span className="text-white font-mono">
                ₱{talentCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Services & Equipment</span>
              <span className="text-white font-mono">
                ₱{serviceCost.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Total Base Cost</span>
              <span className="text-white font-mono">
                ₱{baseCost.toLocaleString()}
              </span>
            </div>
            {listingCost !== baseCost && (
              <p className="text-[10px] text-white/30 text-right">
                Listing prices totaled ₱{listingCost.toLocaleString()} before
                your agreed-price adjustments.
              </p>
            )}
          </div>
        </div>

        {/* Pricing Strategy */}
        <div className="bg-[#161b26] rounded-xl p-5 border border-white/5">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">
              price_check
            </span>
            Pricing Strategy
          </h4>
          <div className="mb-4">
            <label className="text-[10px] text-text-muted block mb-2">
              Target Margin (%)
            </label>
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
            <p className="text-[10px] text-white/30 mt-1.5">
              Percentage added on top of your Total Base Cost to set what
              guests pay.
            </p>
          </div>
          <div className="space-y-1 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">Suggested Price</span>
              <span className="text-base font-bold text-white font-mono">
                ₱{suggestedPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-white/30">
              Total Base Cost × (1 + Target Margin). Drag the slider above to
              adjust.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Health */}
      <div className="p-6 border-t border-white/5 bg-[#0f111a]">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-black font-bold text-sm shrink-0">
            {blueprintHealth.score}%
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-text-muted uppercase font-bold mb-1">
              Blueprint Health
            </p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${blueprintHealth.score}%` }}
              />
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-3 ${
            blueprintHealth.readyToPublish ? "text-accent" : "text-white/40"
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {blueprintHealth.readyToPublish ? "check_circle" : "pending"}
          </span>
          {blueprintHealth.readyToPublish
            ? "Ready to publish"
            : "Not ready yet — see checklist"}
        </div>

        <ul className="space-y-1.5 mb-2">
          {blueprintHealth.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span
                className={`flex items-center gap-1.5 ${item.met ? "text-white" : "text-white/40"}`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] ${item.met ? "text-accent" : "text-white/20"}`}
                >
                  {item.met ? "check_circle" : "radio_button_unchecked"}
                </span>
                {item.label}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  item.required
                    ? "bg-accent/10 text-accent"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {item.required ? "Required" : "Recommended"}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-white/30 mb-4">
          Each of the {blueprintHealth.items.length} checks above is worth{" "}
          {Math.round(100 / blueprintHealth.items.length)}%.
        </p>

        <button
          onClick={onPreview}
          disabled={!onPreview}
          className="w-full py-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">
            open_in_new
          </span>
          Preview Listing
        </button>
      </div>
    </aside>
  );
}

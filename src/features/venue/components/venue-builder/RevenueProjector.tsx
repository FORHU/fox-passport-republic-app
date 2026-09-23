"use client";

import React from "react";

interface RevenueProjectorProps {
  baseRate: number;
  occupancyRate: number;
  extraGuestRate: number;
  capacity: string;
  monthlyBase: number;
  monthlyAddons: number;
  total: number;
  onBaseRateChange: (rate: number) => void;
  onOccupancyRateChange: (rate: number) => void;
  onExtraGuestRateChange: (rate: number) => void;
  onPreview: () => void;
}

export function RevenueProjector({
  baseRate,
  occupancyRate,
  extraGuestRate,
  capacity,
  monthlyBase,
  monthlyAddons,
  total,
  onBaseRateChange,
  onOccupancyRateChange,
  onExtraGuestRateChange,
  onPreview,
}: RevenueProjectorProps) {
  return (
    <aside className="w-full xl:w-80 shrink-0 border-l border-white/5 bg-[#0f111a] flex flex-col shadow-2xl z-10">
      <div className="p-6 border-b border-white/5">
        <h3 className="font-display font-bold text-white text-lg">
          Revenue Projector
        </h3>
        <p className="text-xs text-text-muted">Estimated Monthly Yield</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Base Pricing */}
        <div className="bg-[#161b26] rounded-xl p-5 border border-white/5">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[14px]">
              payments
            </span>
            Base Pricing
          </h4>
          <div className="mb-4">
            <label className="text-[10px] text-text-muted block mb-2">
              Nightly Rate (₱)
            </label>
            <input
              type="number"
              value={baseRate}
              onChange={(e) => onBaseRateChange(Number(e.target.value))}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-right focus:border-accent outline-none text-sm"
            />
            <p className="text-[10px] text-white/30 mt-1.5">
              What you charge per night before any add-ons.
            </p>
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-2">
              Expected Booking Rate (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={occupancyRate}
                onChange={(e) => onOccupancyRateChange(Number(e.target.value))}
                className="flex-1 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-accent font-bold font-mono w-8 text-right text-xs">
                {occupancyRate}%
              </span>
            </div>
            <p className="text-[10px] text-white/30 mt-1.5">
              The percentage of available nights you expect to be booked each month.
            </p>
          </div>
        </div>

        {/* Over-Capacity Requests */}
        <div className="bg-[#161b26] rounded-xl p-5 border border-white/5">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-[14px]">
              groups
            </span>
            Over-Capacity Requests
          </h4>
          <label className="text-[10px] text-text-muted block mb-2">
            Extra Guest Rate (₱, optional)
          </label>
          <input
            type="number"
            min={0}
            value={extraGuestRate || ""}
            onChange={(e) => onExtraGuestRateChange(Number(e.target.value) || 0)}
            placeholder="Leave blank to disallow"
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-right focus:border-accent outline-none text-sm"
          />
          <p className="text-[10px] text-white/30 mt-1.5">
            {extraGuestRate > 0
              ? `A citizen requesting more than ${capacity || "your capacity"} guests pays this per extra guest, at the same rate unit as above. They can't pay until you approve the request.`
              : "Blank means citizens can never book beyond your stated capacity."}
          </p>
        </div>

        {/* Monthly Estimates */}
        <div>
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Monthly Estimates
          </h4>
          <p className="text-[10px] text-white/30 mb-4">
            Based on a 30-day month at your Expected Booking Rate above.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Rental Income</span>
              <span className="text-white font-mono">
                ₱{monthlyBase.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-white/30 -mt-2">
              Nightly Rate × 30 days × Expected Booking Rate.
            </p>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Add-on Revenue</span>
              <span className="text-white font-mono">
                ₱{monthlyAddons.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-white/30 -mt-2">
              From your Monetized Add-ons below — assumes roughly 1 in 5
              bookings purchases one.
            </p>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total Yield</span>
              <span className="text-accent font-mono">
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-[#0f111a]">
        <button
          onClick={onPreview}
          className="w-full py-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all text-sm font-bold text-white flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            visibility
          </span>
          Preview Venue Page
        </button>
      </div>
    </aside>
  );
}

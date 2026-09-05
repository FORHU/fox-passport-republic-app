"use client";

import React from "react";

interface ManualCodeEntryProps {
  manualCode: string;
  setManualCode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export function ManualCodeEntry({
  manualCode,
  setManualCode,
  onSubmit,
  isProcessing,
}: ManualCodeEntryProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-[#ccff00] text-xs font-bold">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Testing without a mobile device?</span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">
          Citizens are assigned a unique Ticket Code on their booking pass (e.g.{" "}
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
            TKT-XXXX
          </code>{" "}
          or{" "}
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
            BKG-XXXX
          </code>
          ). Enter or paste it below to check in:
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-white/70 block">
          Ticket Code / Booking Code
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
            pin
          </span>
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. TKT-A1B2C3D4 or BKG-123456"
            className="w-full bg-white/5 border border-white/10 focus:border-[#ccff00] rounded-2xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none transition-colors"
            autoFocus
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!manualCode.trim() || isProcessing}
        className="w-full py-3.5 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">
          how_to_reg
        </span>
        Verify & Check In
      </button>
    </form>
  );
}

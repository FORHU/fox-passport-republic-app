"use client";

import React from "react";
import { ScanResult, ScanState } from "./types";

interface ScanResultFeedbackProps {
  scanState: ScanState;
  lastResult: ScanResult | null;
  onReset: () => void;
}

export function ScanResultFeedback({
  scanState,
  lastResult,
  onReset,
}: ScanResultFeedbackProps) {
  if (scanState === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center animate-in fade-in zoom-in-95">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-400 text-5xl">
            check_circle
          </span>
        </div>
        <div>
          <p className="text-emerald-400 font-black text-lg mb-1">
            {lastResult?.message || "Check-In Verified!"}
          </p>
          <p className="text-white/40 text-xs font-mono bg-white/5 py-1 px-3 rounded-lg inline-block border border-white/10">
            {lastResult?.ticketCode}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-black text-xs hover:bg-[#b8e600] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            how_to_reg
          </span>
          Check In Next Guest
        </button>
      </div>
    );
  }

  if (scanState === "already_checked_in") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center animate-in fade-in zoom-in-95">
        <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-400 text-5xl">
            warning
          </span>
        </div>
        <div>
          <p className="text-amber-400 font-black text-lg mb-1">
            {lastResult?.message || "Already Checked In"}
          </p>
          <p className="text-white/40 text-xs font-mono bg-white/5 py-1 px-3 rounded-lg inline-block border border-white/10">
            {lastResult?.ticketCode}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 rounded-full border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Try Another Code
        </button>
      </div>
    );
  }

  if (scanState === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center animate-in fade-in zoom-in-95">
        <div className="h-20 w-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-rose-400 text-5xl">
            cancel
          </span>
        </div>
        <div>
          <p className="text-rose-400 font-black text-lg mb-1">
            Check-In Failed
          </p>
          <p className="text-white/50 text-xs max-w-xs">
            {lastResult?.message || "This ticket could not be verified."}
          </p>
          {lastResult?.ticketCode && (
            <p className="text-white/30 text-[10px] font-mono mt-1">
              {lastResult.ticketCode}
            </p>
          )}
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-black text-xs hover:bg-[#b8e600] transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Try Again
        </button>
      </div>
    );
  }

  return null;
}

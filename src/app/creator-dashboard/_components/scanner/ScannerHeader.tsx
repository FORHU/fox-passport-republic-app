"use client";

import React from "react";

export function ScannerHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-xl bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
        <span className="material-symbols-outlined text-[#ccff00] text-[22px]">
          qr_code_scanner
        </span>
      </div>
      <div>
        <h2 className="text-xl font-display font-bold text-white">
          Guest Check-In
        </h2>
        <p className="text-white/50 text-xs">
          Verify citizen entry pass & trigger instant payout
        </p>
      </div>
    </div>
  );
}

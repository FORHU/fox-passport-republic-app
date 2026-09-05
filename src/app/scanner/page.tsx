import React from "react";
import Link from "next/link";
import QRScannerClient from "@/app/creator-dashboard/_components/QRScannerClient";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col justify-between p-4 sm:p-6 pb-28">
      {/* Top back navigation bar */}
      <div className="max-w-lg w-full mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/creator-dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-white/5 border border-white/10"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Dashboard
        </Link>
        <span className="text-[11px] font-mono text-[#ccff00]">FoxCheck v2.4</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <QRScannerClient />
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

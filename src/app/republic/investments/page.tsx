import React from "react";
import Link from "next/link";
import PartnerInventoryMap from "@/features/investment/components/PartnerInventoryMap";
import RepublicHeader from "@/features/republic/components/RepublicHeader";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";

export const dynamic = "force-dynamic";

export default function RepublicInvestmentsMapPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-20 pb-36 px-3 sm:px-6 selection:bg-amber-400 selection:text-black">
      {/* Full-width docked header */}
      <RepublicHeader />

      <div className="max-w-6xl mx-auto space-y-5">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/republic?tab=partners"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-semibold transition-colors mb-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                arrow_back
              </span>
              Back to Republic Partners Feed
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-3xl">
                radar
              </span>
              Equipment Depots & Capital Map
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Interactive supply chain map connecting Partner Foxer equipment
              hubs (chairs, staging, audio, power) to venues in need.
            </p>
          </div>

          <Link
            href="/foxer/create-investment"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_circle
            </span>
            Register Investment Hub
          </Link>
        </div>

        {/* Full-screen interactive map with responsive height */}
        <PartnerInventoryMap className="h-[440px] sm:h-[620px] w-full rounded-3xl overflow-hidden" />
      </div>

      {/* Mobile Floating Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

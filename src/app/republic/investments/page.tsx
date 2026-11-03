import React from "react";
import Link from "next/link";
import PartnerInventoryMap from "@/features/investment/components/PartnerInventoryMap";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { getUser } from "@/shared/lib/server/auth";
import { hasPermission } from "@/shared/lib/permissions";
import { BackButton } from "@/shared/components/ui/BackButton";

export const dynamic = "force-dynamic";

export default async function RepublicInvestmentsMapPage() {
  // Registering a hub is for investors (`partnership:propose`); everyone else
  // was sent to the investor application by a button saying "Register".
  const canRegister = hasPermission(await getUser(), "partnership:propose");
  return (
    <div className="min-h-screen bg-canvas text-white pt-20 sm:pt-32 pb-36 px-3 sm:px-6 selection:bg-amber-400 selection:text-black">
      {/* The same top bar (and mobile bottom nav) as every other app page */}
      <LandingHeader />

      <div className="max-w-6xl mx-auto space-y-5">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <BackButton
              variant="label"
              href="/republic?tab=partners"
              label="Back to Republic Partners Feed"
              className="mb-2"
            />
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
            href={
              canRegister ? "/foxer/create-investment" : "/foxer/apply-investor"
            }
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {canRegister ? "add_circle" : "handshake"}
            </span>
            {canRegister ? "Register Investment Hub" : "Become a Partner"}
          </Link>
        </div>

        {/* Full-screen interactive map with responsive height */}
        <PartnerInventoryMap className="h-[440px] sm:h-[620px] w-full rounded-3xl overflow-hidden" />
      </div>
    </div>
  );
}

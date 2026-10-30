import React from "react";
import QRScannerClient from "@/app/creator-dashboard/_components/QRScannerClient";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { getUser } from "@/shared/lib/server/auth";
import { getDashboardPath } from "@/shared/lib/dashboard-path";
import { BackButton } from "@/shared/components/ui/BackButton";

export default async function ScannerPage() {
  // Check-in Helpers can be plain users, and the scanner is in everyone's
  // menu; a fixed /creator-dashboard link bounced them to the home page.
  const back = getDashboardPath(await getUser());
  return (
    <div className="min-h-screen bg-canvas text-white flex flex-col justify-between p-4 sm:p-6 pb-28">
      {/* Top back navigation bar */}
      <div className="max-w-lg w-full mx-auto mb-4 flex items-center justify-between">
        <BackButton
          variant="label"
          href={back}
          label={back === "/user" ? "Passport" : "Dashboard"}
        />
        <span className="text-[11px] font-mono text-accent">
          FoxCheck v2.4
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <QRScannerClient />
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}

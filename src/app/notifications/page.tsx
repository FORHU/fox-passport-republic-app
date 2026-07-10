import React, { Suspense } from "react";
import NotificationListClient from "@/features/notifications/components/NotificationListClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications | Fox Passport Republic",
  description: "View your in-app notifications.",
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background bg-gradient-dark text-text-main font-body selection:bg-accent selection:text-black">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
          </div>
        }
      >
        <NotificationListClient />
      </Suspense>
    </div>
  );
}

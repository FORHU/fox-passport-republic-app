import React from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/shared/lib/server/auth";
import { getUserDashboard, getVenues } from "@/shared/lib/server/data";
import UserDashboardClient from "./_components/UserDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

export default async function UserDashboard() {
  const user = await requireAuth();
  const [dashboardData, venues] = await Promise.all([
    getUserDashboard(user.id),
    getVenues(),
  ]);

  return (
    <UserDashboardClient
      user={user}
      dashboardData={dashboardData}
      venues={venues}
    />
  );
}

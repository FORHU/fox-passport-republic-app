import React from "react";
import { requireHost } from "@/shared/lib/server/auth";
import { getHostDashboard } from "@/shared/lib/server/data";
import HostDashboardClient from "./_components/HostDashboardClient";
import MobileCreatorHome from "@/features/dashboard/components/MobileCreatorHome";
import { OrganizingSection } from "@/features/appointment/components/OrganizingSection";
import { OpenToOrganizersSection } from "@/features/appointment/components/OpenToOrganizersSection";
import { MobilePendingRequests } from "./_components/MobilePendingRequests";

export default async function Dashboard() {
  const user = await requireHost();
  const data = await getHostDashboard(user.id);

  return (
    <>
      <MobileCreatorHome
        user={user}
        organizing={
          <div className="space-y-6">
            <OrganizingSection />
            <OpenToOrganizersSection />
          </div>
        }
        pendingRequests={<MobilePendingRequests />}
      />
      <div className="hidden lg:block">
        <HostDashboardClient initialData={data} />
      </div>
    </>
  );
}

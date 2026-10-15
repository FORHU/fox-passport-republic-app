import React from "react";
import { requireHost } from "@/shared/lib/server/auth";
import { getHostDashboard } from "@/shared/lib/server/data";
import HostDashboardClient from "./_components/HostDashboardClient";
import MobileCreatorHome from "@/features/dashboard/components/MobileCreatorHome";
import { OrganizingSection } from "@/features/appointment/components/OrganizingSection";
import { OpenToOrganizersSection } from "@/features/appointment/components/OpenToOrganizersSection";
import { OrganizerAttention } from "./_components/OrganizerAttention";
import { MobilePendingRequests } from "./_components/MobilePendingRequests";
import { PartnershipsOverview } from "@/features/partnership/components/PartnershipsOverview";
import { hasPermission } from "@/shared/lib/permissions";
import { RoleGettingStarted } from "./_components/RoleGettingStarted";
import { TourReplayButton } from "@/shared/components/ui/ProductTour";
import { CREATOR_TOUR_KEY } from "./_components/creatorTour";

export default async function Dashboard() {
  const user = await requireHost();
  const data = await getHostDashboard(user.id);
  const isInvestor = hasPermission(user, "partnership:propose");
  const receivesProposals =
    hasPermission(user, "template:manage") ||
    hasPermission(user, "venue:manage");

  return (
    <>
      <MobileCreatorHome
        user={user}
        organizing={
          <div className="space-y-6">
            <div className="flex justify-end -mb-3">
              <TourReplayButton tourKey={CREATOR_TOUR_KEY} />
            </div>
            <div data-tour="host-guide">
              <RoleGettingStarted
                totals={{
                  venues: data.venues?.length ?? 0,
                  events: data.events?.length ?? 0,
                  assets: data.inventory?.length ?? 0,
                  services: data.services?.length ?? 0,
                }}
              />
            </div>
            <div data-tour="host-attention">
              <OrganizerAttention />
            </div>
            <div data-tour="host-organizing">
              <OrganizingSection />
            </div>
            <div data-tour="host-open">
              <OpenToOrganizersSection />
            </div>
            {(isInvestor || receivesProposals) && (
              <div data-tour="host-partnerships">
                <PartnershipsOverview isInvestor={isInvestor} />
              </div>
            )}
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

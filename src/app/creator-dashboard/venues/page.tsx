export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import { getVenuesByHostId } from "@/shared/lib/server/data";
import HostVenuesClient from "@/features/dashboard/components/HostVenuesClient";
import MobileMyListingsView from "@/features/dashboard/components/MobileMyListingsView";
import { RoleGettingStarted } from "../_components/RoleGettingStarted";

export default async function HostVenuesPage() {
  const user = await requirePermission("venue:manage");
  const venues = await getVenuesByHostId(user.id);

  const guide = (
    <RoleGettingStarted
      onlyRole="venueFoxer"
      totals={{ venues: venues.length, events: 0, assets: 0, services: 0 }}
    />
  );

  return (
    <>
      {/* Each view places the guide below its own fixed nav. */}
      <div className="lg:hidden">
        <MobileMyListingsView venues={venues} guide={guide} />
      </div>
      <div className="hidden lg:block">
        <HostVenuesClient initialVenues={venues} guide={guide} />
      </div>
    </>
  );
}

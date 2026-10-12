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
      <div className="lg:hidden">
        <div className="px-5 pt-4">{guide}</div>
        <MobileMyListingsView venues={venues} />
      </div>
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-6 pt-6">{guide}</div>
        <HostVenuesClient initialVenues={venues} />
      </div>
    </>
  );
}

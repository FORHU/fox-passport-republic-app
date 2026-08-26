export const dynamic = "force-dynamic";

import { requireAuth } from "@/shared/lib/server/auth";
import { getVenuesByHostId } from "@/shared/lib/server/data";
import HostVenuesClient from "@/features/dashboard/components/HostVenuesClient";
import MobileMyListingsView from "@/features/dashboard/components/MobileMyListingsView";

export default async function HostVenuesPage() {
  const user = await requireAuth();
  const venues = await getVenuesByHostId(user.id);

  return (
    <>
      <div className="lg:hidden">
        <MobileMyListingsView />
      </div>
      <div className="hidden lg:block">
        <HostVenuesClient initialVenues={venues} />
      </div>
    </>
  );
}

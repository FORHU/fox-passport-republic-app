export const dynamic = "force-dynamic";

import { requireAuth } from "@/shared/lib/server/auth";
import { getVenuesByHostId } from "@/shared/lib/server/data";
import HostVenuesClient from "@/features/dashboard/components/HostVenuesClient";

export default async function HostVenuesPage() {
  const user = await requireAuth();
  const venues = await getVenuesByHostId(user.id);

  return <HostVenuesClient initialVenues={venues} />;
}

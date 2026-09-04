export const dynamic = "force-dynamic";

import { getVenues } from "@/shared/lib/server/data";
import { VenuesMapPageClient } from "@/features/venue/components/VenuesMapPageClient";

export default async function VenuesMapPage() {
  const venues = await getVenues();
  return <VenuesMapPageClient venues={venues} />;
}

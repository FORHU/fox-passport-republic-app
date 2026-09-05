export const dynamic = "force-dynamic";

import { getVenues } from "@/shared/lib/server/data";
import { VenuesMapPageClient } from "@/features/venue/components/VenuesMapPageClient";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";

export default async function VenuesMapPage() {
  const venues = await getVenues();
  return (
    <>
      <LandingHeader />
      <VenuesMapPageClient venues={venues} />
    </>
  );
}

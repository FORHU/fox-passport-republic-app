import VenueCreationClient from "@/features/venue/components/VenueCreationClient";
import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

export default async function VenueFoxerCreateVenuePage() {
  return (await studioAccessDenied("venue")) ?? <VenueCreationClient />;
}

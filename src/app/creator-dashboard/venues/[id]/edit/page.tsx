export const dynamic = "force-dynamic";

import { studioAccessDenied } from "@/shared/lib/server/studioAccess";
import VenueEditClient from "./_components/VenueEditClient";
import { VenueEditSwitch } from "./_components/VenueEditSwitch";
import MobileVenueStudio from "@/features/dashboard/components/MobileVenueStudio";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostVenueEditPage({ params }: Props) {
  // The Mayor and the venue's Organizers both work here (VenueEditSwitch),
  // and Organizers hold no `venue:manage` — so the Venue Studio's access-denied
  // page is handed to the switch rather than shown here, and used only for
  // someone who is neither. The API decides every save.
  const denied = await studioAccessDenied("venue");
  const { id } = await params;
  return (
    <VenueEditSwitch venueId={id} denied={denied}>
      <div className="lg:hidden">
        <MobileVenueStudio venueId={id} />
      </div>
      <div className="hidden lg:block">
        <VenueEditClient id={id} />
      </div>
    </VenueEditSwitch>
  );
}

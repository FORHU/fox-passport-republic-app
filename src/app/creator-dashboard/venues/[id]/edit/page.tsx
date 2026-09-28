export const dynamic = "force-dynamic";

import { requireAuth } from "@/shared/lib/server/auth";
import VenueEditClient from "./_components/VenueEditClient";
import { VenueEditSwitch } from "./_components/VenueEditSwitch";
import MobileVenueStudio from "@/features/dashboard/components/MobileVenueStudio";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostVenueEditPage({ params }: Props) {
  // The Mayor and the venue's Organizers both work here (VenueEditSwitch),
  // and Organizers hold no `venue:manage`. The API decides every save.
  await requireAuth();
  const { id } = await params;
  return (
    <VenueEditSwitch venueId={id}>
      <div className="lg:hidden">
        <MobileVenueStudio venueId={id} />
      </div>
      <div className="hidden lg:block">
        <VenueEditClient id={id} />
      </div>
    </VenueEditSwitch>
  );
}

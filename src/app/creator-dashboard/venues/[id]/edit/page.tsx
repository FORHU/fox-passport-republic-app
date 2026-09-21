export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import VenueEditClient from "./_components/VenueEditClient";
import MobileVenueStudio from "@/features/dashboard/components/MobileVenueStudio";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostVenueEditPage({ params }: Props) {
  await requirePermission("venue:manage");
  const { id } = await params;
  return (
    <>
      <div className="lg:hidden">
        <MobileVenueStudio venueId={id} />
      </div>
      <div className="hidden lg:block">
        <VenueEditClient id={id} />
      </div>
    </>
  );
}

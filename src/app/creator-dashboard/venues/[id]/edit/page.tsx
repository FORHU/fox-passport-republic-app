import VenueEditClient from "./_components/VenueEditClient";
import MobileVenueStudio from "@/features/dashboard/components/MobileVenueStudio";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostVenueEditPage({ params }: Props) {
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

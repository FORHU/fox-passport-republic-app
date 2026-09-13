export const dynamic = "force-dynamic";

import { getVenueById } from "@/shared/lib/server/data";
import { notFound } from "next/navigation";
import VenueDetailPageClient from "./_components/VenueDetailPageClient";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  const host = venue.host ?? { name: "Venue Owner", avatar: "", bio: "" };

  return <VenueDetailPageClient venue={venue} host={host} />;
}

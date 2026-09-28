export const dynamic = "force-dynamic";

import { requireHost } from "@/shared/lib/server/auth";
import SuppliersPageClient from "./_components/SuppliersPageClient";

interface Props {
  params: Promise<{ eventId: string }>;
}

// Who may see an Event's Suppliers and bids is the api's call (its Owner and
// Organizers); this only keeps out people with no dashboard at all.
export default async function EventSuppliersPage({ params }: Props) {
  await requireHost();
  const { eventId } = await params;
  return <SuppliersPageClient eventId={eventId} />;
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requirePermission } from "@/shared/lib/server/auth";
import { getEvents } from "@/shared/lib/server/data";
import HostEventsClient from "@/features/dashboard/components/HostEventsClient";
import { mapTemplateToEventItem } from "@/features/dashboard/mappers/hostDashboard";
import { NeedsAttentionSection } from "@/features/event/components/booked/NeedsAttentionSection";

interface Props {
  searchParams: Promise<{ eventId?: string | string[] }>;
}

export default async function HostEventsPage({ searchParams }: Props) {
  const user = await requirePermission("template:manage");
  // The api's booked-event notifications (a Supplier declined, a conflict, a
  // proposal answered) link here with `?eventId=`; that event's Suppliers are
  // where it is seen and repaired. Mobile reads the same link.
  const { eventId } = await searchParams;
  const id = Array.isArray(eventId) ? eventId[0] : eventId;
  if (id) redirect(`/creator-dashboard/suppliers/${encodeURIComponent(id)}`);

  const events = await getEvents(user.id);

  const hostEvents = events.map(mapTemplateToEventItem);

  return (
    <HostEventsClient
      initialEvents={hostEvents}
      banner={<NeedsAttentionSection />}
    />
  );
}

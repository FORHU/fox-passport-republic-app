export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import { getEvents } from "@/shared/lib/server/data";
import HostEventsClient from "@/features/dashboard/components/HostEventsClient";
import { mapTemplateToEventItem } from "@/features/dashboard/mappers/hostDashboard";

export default async function HostEventsPage() {
  const user = await requirePermission("template:manage");
  const events = await getEvents(user.id);

  const hostEvents = events.map(mapTemplateToEventItem);

  return <HostEventsClient initialEvents={hostEvents} />;
}

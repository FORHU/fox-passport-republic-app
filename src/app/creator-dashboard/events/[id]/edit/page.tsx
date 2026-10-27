export const dynamic = "force-dynamic";

import { studioAccessDenied } from "@/shared/lib/server/studioAccess";
import EventEditClient from "./_components/EventEditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostEventEditPage({ params }: Props) {
  const denied = await studioAccessDenied("event");
  if (denied) return denied;
  const { id } = await params;
  return <EventEditClient id={id} />;
}

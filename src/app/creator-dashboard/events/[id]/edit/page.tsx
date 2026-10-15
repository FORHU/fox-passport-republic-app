export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import EventEditClient from "./_components/EventEditClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostEventEditPage({ params }: Props) {
  await requirePermission("template:manage");
  const { id } = await params;
  return <EventEditClient id={id} />;
}

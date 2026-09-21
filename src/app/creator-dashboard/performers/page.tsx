export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import { getServicesByHostId } from "@/shared/lib/server/data";
import HostPerformersClient from "@/features/dashboard/components/HostPerformersClient";

export default async function HostPerformersPage() {
  const user = await requirePermission("performer:manage");
  const hostId = user.id || (user as any).userId;

  if (!hostId) {
    throw new Error("Host ID not found");
  }

  const services = await getServicesByHostId(hostId);

  return <HostPerformersClient initialServices={services} />;
}

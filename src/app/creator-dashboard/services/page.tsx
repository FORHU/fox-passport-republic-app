export const dynamic = "force-dynamic";

import { requireAnyPermission } from "@/shared/lib/server/auth";
import { getServicesByHostId } from "@/shared/lib/server/data";
import HostServicesClient from "@/features/dashboard/components/HostServicesClient";

export default async function HostServicesPage() {
  const user = await requireAnyPermission([
    "service:manage",
    "performer:manage",
  ]);
  const hostId = user.id || (user as any).userId;

  if (!hostId) {
    throw new Error("Host ID not found");
  }

  const services = await getServicesByHostId(hostId);

  return <HostServicesClient initialServices={services} />;
}

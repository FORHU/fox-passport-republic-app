export const dynamic = "force-dynamic";

import { requireAnyPermission } from "@/shared/lib/server/auth";
import { getServicesByHostId } from "@/shared/lib/server/data";
import HostServicesClient from "@/features/dashboard/components/HostServicesClient";
import { mapBackendServiceToServiceItem } from "@/features/dashboard/mappers/listings";

export default async function HostServicesPage() {
  const user = await requireAnyPermission([
    "service:manage",
    "performer:manage",
  ]);
  const hostId = user.id || (user as any).userId;

  if (!hostId) {
    throw new Error("Host ID not found");
  }

  // The list rows read the dashboard shape (picture, placeholder icon, price
  // unit), as on the Overview; the raw API service has none of those (app#437).
  const services = (await getServicesByHostId(hostId)).map(
    mapBackendServiceToServiceItem,
  );

  return <HostServicesClient initialServices={services} />;
}

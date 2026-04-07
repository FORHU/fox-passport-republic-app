export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/server/auth';
import { getServicesByHostId } from '@/lib/server/data';
import HostServicesClient from '@/components/host/HostServicesClient';

export default async function HostServicesPage() {
  const user = await requireAuth();
  const hostId = user.id || (user as any).userId;

  if (!hostId) {
    throw new Error('Host ID not found');
  }

  const services = await getServicesByHostId(hostId);

  return <HostServicesClient initialServices={services} />;
}


import React from 'react';
import { requireHost } from '@/shared/lib/server/auth';
import { getHostDashboard } from '@/shared/lib/server/data';
import HostDashboardClient from '@/features/dashboard/components/HostDashboardClient';

export default async function Dashboard() {
  const user = await requireHost();
  const data = await getHostDashboard(user.id);

  return <HostDashboardClient initialData={data} />;
}

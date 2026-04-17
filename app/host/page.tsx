import React from 'react';
import { requireHost } from '@/lib/server/auth';
import { getHostDashboard } from '@/lib/server/data';
import HostDashboardClient from './HostDashboardClient';

export default async function Dashboard() {
  const user = await requireHost();
  const data = await getHostDashboard(user.id);

  return <HostDashboardClient initialData={data} />;
}

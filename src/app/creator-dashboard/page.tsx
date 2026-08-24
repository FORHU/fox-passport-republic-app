import React from 'react';
import { requireHost } from '@/shared/lib/server/auth';
import { getHostDashboard } from '@/shared/lib/server/data';
import HostDashboardClient from '@/features/dashboard/components/HostDashboardClient';
import MobileCreatorHome from '@/features/dashboard/components/MobileCreatorHome';

export default async function Dashboard() {
  const user = await requireHost();
  const data = await getHostDashboard(user.id);

  return (
    <>
      <MobileCreatorHome user={user} />
      <div className="hidden lg:block">
        <HostDashboardClient initialData={data} />
      </div>
    </>
  );
}

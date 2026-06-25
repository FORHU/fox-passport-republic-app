import React from 'react';
import { requireAuth } from '@/lib/server/auth';
import { getUserDashboard, getVenues } from '@/lib/server/data';
import UserDashboardClient from '@/components/users/UserDashboardClient';

export const dynamic = 'force-dynamic';

export default async function UserDashboard() {
  const user = await requireAuth();
  const [dashboardData, venues] = await Promise.all([
    getUserDashboard(user.id),
    getVenues(),
  ]);

  return <UserDashboardClient user={user} dashboardData={dashboardData} venues={venues} />;
}

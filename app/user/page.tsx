import React from 'react';
import { requireAuth } from '@/lib/server/auth';
import { getUserDashboard } from '@/lib/server/data';
import UserDashboardClient from './UserDashboardClient';

export default async function UserDashboard() {
  const user = await requireAuth();
  const dashboardData = await getUserDashboard(user.id);

  return <UserDashboardClient user={user} dashboardData={dashboardData} />;
}

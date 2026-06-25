export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import { getHostDashboard } from '@/shared/lib/server/data'
import HostVenuesClient from '@/features/dashboard/components/HostVenuesClient'

export default async function HostVenuesPage() {
  const user = await requireAuth()
  const dashboard = await getHostDashboard(user.id)
  const venues = dashboard.venues

  return <HostVenuesClient initialVenues={venues} />
}


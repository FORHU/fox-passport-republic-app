export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/server/auth'
import { getHostDashboard } from '@/lib/server/data'
import HostVenuesClient from '@/components/host/HostVenuesClient'

export default async function HostVenuesPage() {
  const user = await requireAuth()
  const dashboard = await getHostDashboard(user.id)
  const venues = dashboard.venues

  return <HostVenuesClient initialVenues={venues} />
}


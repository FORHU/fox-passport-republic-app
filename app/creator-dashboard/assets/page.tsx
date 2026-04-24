export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/server/auth'
import { getHostDashboard } from '@/lib/server/data'
import HostAssetsClient from '@/components/host/HostAssetsClient'

export default async function HostAssetsPage() {
  const user = await requireAuth()
  const dashboard = await getHostDashboard(user.id)
  const inventory = dashboard.inventory

  return <HostAssetsClient initialInventory={inventory} />
}


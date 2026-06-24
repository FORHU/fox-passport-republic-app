export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import { getHostDashboard } from '@/shared/lib/server/data'
import HostAssetsClient from '@/features/dashboard/components/HostAssetsClient'

export default async function HostAssetsPage() {
  const user = await requireAuth()
  const dashboard = await getHostDashboard(user.id)
  const inventory = dashboard.inventory

  return <HostAssetsClient initialInventory={inventory} />
}


export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import PassportStampsClient from '@/features/gamification/components/PassportStampsClient'

export default async function PassportPage() {
  const user = await requireAuth()
  const userId = user.id ?? user.userId ?? ''
  return <PassportStampsClient userId={userId} />
}

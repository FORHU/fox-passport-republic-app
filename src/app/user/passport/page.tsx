export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import PassportClient from '@/features/user/components/PassportClient'

export default async function PassportPage() {
  const user = await requireAuth()
  return <PassportClient user={user} />
}

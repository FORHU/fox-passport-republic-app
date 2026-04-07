export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/server/auth'
import PassportClient from '@/components/users/PassportClient'

export default async function PassportPage() {
  const user = await requireAuth()
  return <PassportClient user={user} />
}

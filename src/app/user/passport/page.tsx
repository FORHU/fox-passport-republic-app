export const dynamic = "force-dynamic";

import { requireAuth } from '@/shared/lib/server/auth'
import PassportClient from '@/features/user/components/PassportClient'
import MobilePassportView from '@/features/user/components/MobilePassportView'

export default async function PassportPage() {
  const user = await requireAuth()
  return (
    <>
      <div className="lg:hidden">
        <MobilePassportView user={user} />
      </div>
      <div className="hidden lg:block">
        <PassportClient user={user} />
      </div>
    </>
  )
}

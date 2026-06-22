export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import { getEvents } from '@/shared/lib/server/data'
import HostEventsClient from '@/features/dashboard/components/HostEventsClient'

export default async function HostEventsPage() {
  const user = await requireAuth()
  const events = await getEvents()

  // Filter events for this host
  const hostEvents = events.filter((event: any) => event.hostId === user.id)

  return <HostEventsClient initialEvents={hostEvents} />
}


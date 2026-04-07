export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/server/auth'
import { getEvents } from '@/lib/server/data'
import HostEventsClient from '@/components/host/HostEventsClient'

export default async function HostEventsPage() {
  const user = await requireAuth()
  const events = await getEvents()

  // Filter events for this host
  const hostEvents = events.filter((event: any) => event.hostId === user.id)

  return <HostEventsClient initialEvents={hostEvents} />
}


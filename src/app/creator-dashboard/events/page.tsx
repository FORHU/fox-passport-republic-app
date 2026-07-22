export const dynamic = 'force-dynamic';

import { requireAuth } from '@/shared/lib/server/auth'
import { getEvents } from '@/shared/lib/server/data'
import HostEventsClient from '@/features/dashboard/components/HostEventsClient'
import { EventItem } from '@/features/dashboard/data/dashboardData'

export default async function HostEventsPage() {
  const user = await requireAuth()
  const events = await getEvents()

  const hostEvents: EventItem[] = events
    .filter((e: any) => e.ownerId === user.id)
    .map((e: any) => ({
      id: e.id,
      title: e.name ?? 'Untitled',
      date: e.createdAt
        ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      loc: [e.targetCity, e.targetState].filter(Boolean).join(', ') || '—',
      type: e.category ?? 'other',
      status: e.status ?? 'draft',
      booked: null,
      capacity: e.maxAttendees ?? null,
      revenue: null,
      img: e.images?.[0]?.url ?? '',
    }))

  return <HostEventsClient initialEvents={hostEvents} />
}


export const dynamic = 'force-dynamic';

import { getVenues } from '@/shared/lib/server/data'
import ReviewSelectClient from '@/features/review/components/ReviewSelectClient'

export default async function ReviewSelectPage() {
  const venues = await getVenues()
  const recentVenues = venues.slice(0, 4)

  return <ReviewSelectClient recentVenues={recentVenues} />
}

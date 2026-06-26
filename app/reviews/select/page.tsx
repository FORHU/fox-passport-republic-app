export const dynamic = 'force-dynamic';

import { getVenues } from '@/lib/server/data'
import ReviewSelectClient from '@/components/reviews/ReviewSelectClient'

export default async function ReviewSelectPage() {
  const venues = await getVenues()
  const recentVenues = venues.slice(0, 4)

  return <ReviewSelectClient recentVenues={recentVenues} />
}

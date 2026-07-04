export const dynamic = 'force-dynamic';

import { getBookingById } from '@/shared/lib/server/data';
import { notFound } from 'next/navigation';
import WriteReviewClient from '@/features/review/components/WriteReviewClient';

export default async function WriteReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  return <WriteReviewClient booking={booking} />;
}

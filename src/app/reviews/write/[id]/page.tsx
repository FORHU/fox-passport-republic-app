export const dynamic = 'force-dynamic';

import { getVenueById } from '@/shared/lib/server/data';
import { notFound } from 'next/navigation';
import WriteReviewClient from '@/features/review/components/WriteReviewClient';

export default async function WriteReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  return <WriteReviewClient venue={venue} />;
}

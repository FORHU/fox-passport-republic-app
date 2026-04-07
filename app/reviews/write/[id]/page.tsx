export const dynamic = 'force-dynamic';

﻿import { getVenueById } from '@/lib/server/data';
import { notFound } from 'next/navigation';
import WriteReviewClient from '@/components/reviews/WriteReviewClient';

export default async function WriteReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const venue = await getVenueById(params.id);

  if (!venue) {
    notFound();
  }

  return <WriteReviewClient venue={venue} />;
}

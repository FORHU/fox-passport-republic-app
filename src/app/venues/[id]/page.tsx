export const dynamic = 'force-dynamic';

import { getVenueById } from '@/shared/lib/server/data';
import { notFound } from 'next/navigation';
import VenueDetailClient from '@/features/venue/components/VenueDetailClient';

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    notFound();
  }

  const host = venue.host ?? { name: 'Venue Owner', avatar: '', bio: '' };

  return <VenueDetailClient venue={venue} host={host} />;
}


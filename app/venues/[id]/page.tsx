export const dynamic = 'force-dynamic';

﻿import { getVenueById } from '@/lib/server/data';
import { notFound } from 'next/navigation';
import VenueDetailClient from '@/components/venues/VenueDetailClient';

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

  // For now, mock host, or fetch
  const host = { name: 'Host Name', bio: 'Host bio', avatar: '' }; // TODO: fetch host

  return <VenueDetailClient venue={venue} host={host} />;
}


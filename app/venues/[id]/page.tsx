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
  const host = { name: 'Neon Vertex', bio: "I'm a local photographer and nightlife curator. I specialize in finding the spots that aren't on the maps.", avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAawAmjQLUXCUHrFlbDS_ydJnuUpm_WUNW9I5alXTGfJCNDU8_Gnn4cey4Tt_fcRefnkP3AK4S1C13YiOGOnCLmz3aSgwJP_JwChCJBNSCeFugn97n0lpqg6JVBy926WV4xcXgfaLeBW6GNWknG__nTJeUYtmKctJxCDA5ODZq2ZxpowxJKzUXEpcS9W1ThdbCuR0rXQTeqeW2URDNRYLxCNmXPoWUlxq_9LdMzamdZIYkwK2XK3b0k_kVV4njSFnmyGojp2293vrU' }; 

  return <VenueDetailClient venue={venue} host={host} />;
}


import VenueEditClient from './_components/VenueEditClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostVenueEditPage({ params }: Props) {
  const { id } = await params;
  return <VenueEditClient id={id} />;
}

export const dynamic = 'force-dynamic';

import AssetBookingClient from '@/components/booking/AssetBookingClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssetBookingPage({ params }: Props) {
  const { id } = await params;
  return <AssetBookingClient assetId={id} />;
}

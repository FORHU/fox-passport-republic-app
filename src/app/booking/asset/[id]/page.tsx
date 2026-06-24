export const dynamic = 'force-dynamic';

import AssetBookingClient from '@/features/booking/components/AssetBookingClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssetBookingPage({ params }: Props) {
  const { id } = await params;
  return <AssetBookingClient assetId={id} />;
}

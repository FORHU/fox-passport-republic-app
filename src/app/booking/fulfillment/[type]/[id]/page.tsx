export const dynamic = 'force-dynamic';

import FulfillmentPassClient from '@/features/booking/components/FulfillmentPassClient';

export default async function FulfillmentPassPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const bookingType = type === 'asset' ? 'asset' : 'service';
  return <FulfillmentPassClient bookingType={bookingType} bookingId={id} />;
}

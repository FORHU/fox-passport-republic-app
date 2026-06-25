export const dynamic = 'force-dynamic';

import ServiceBookingClient from '@/features/booking/components/ServiceBookingClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ServiceBookingPage({ params }: Props) {
  const { id } = await params;
  return <ServiceBookingClient serviceId={id} />;
}

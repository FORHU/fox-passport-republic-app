import EventEditClient from './_components/EventEditClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostEventEditPage({ params }: Props) {
  const { id } = await params;
  return <EventEditClient id={id} />;
}

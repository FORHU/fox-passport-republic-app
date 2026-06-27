import ServiceEditClient from './_components/ServiceEditClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostServiceEditPage({ params }: Props) {
  const { id } = await params;
  return <ServiceEditClient id={id} />;
}

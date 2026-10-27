import ServiceEditClient from "./_components/ServiceEditClient";
import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HostServiceEditPage({ params }: Props) {
  const denied = await studioAccessDenied("service");
  if (denied) return denied;
  const { id } = await params;
  return <ServiceEditClient id={id} />;
}

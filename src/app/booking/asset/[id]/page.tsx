export const dynamic = "force-dynamic";

import AssetBookingClient from "@/app/booking/_components/AssetBookingClient";



interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssetBookingPage({ params }: Props) {
  const { id } = await params;
  return <AssetBookingClient assetId={id} />;
}

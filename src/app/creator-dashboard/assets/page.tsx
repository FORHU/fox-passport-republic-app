export const dynamic = "force-dynamic";

import { requireAuth } from "@/shared/lib/server/auth";
import { getAssetsByHostId } from "@/shared/lib/server/data";
import HostAssetsClient from "@/features/dashboard/components/HostAssetsClient";

export default async function HostAssetsPage() {
  const user = await requireAuth();
  const inventory = await getAssetsByHostId(user.id);

  return <HostAssetsClient initialInventory={inventory} />;
}

export const dynamic = "force-dynamic";

import { requirePermission } from "@/shared/lib/server/auth";
import { getAssetsByHostId } from "@/shared/lib/server/data";
import HostAssetsClient from "@/features/dashboard/components/HostAssetsClient";
import { mapBackendAssetToInventoryItem } from "@/features/dashboard/mappers/listings";

export default async function HostAssetsPage() {
  const user = await requirePermission("asset:manage");
  // The tiles read the dashboard shape (`img`), as on the Overview; the raw API
  // asset only has `images` (app#437).
  const inventory = (await getAssetsByHostId(user.id)).map(
    mapBackendAssetToInventoryItem,
  );

  return <HostAssetsClient initialInventory={inventory} />;
}

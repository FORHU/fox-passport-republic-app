export const dynamic = "force-dynamic";

import { requireAuth } from "@/shared/lib/server/auth";
import {
  getAssetsByHostId,
  getServicesByHostId,
  getVenuesByHostId,
} from "@/shared/lib/server/data";
import FoxerPromotionsClient from "@/features/dashboard/components/FoxerPromotionsClient";

export default async function CreatorPromotionsPage() {
  const user = await requireAuth();
  const [assets, services, venues] = await Promise.all([
    getAssetsByHostId(user.id),
    getServicesByHostId(user.id),
    getVenuesByHostId(user.id),
  ]);

  const listingOptions = [
    ...assets.map((a: any) => ({
      id: String(a.id),
      name: a.name,
      kind: "asset" as const,
    })),
    ...services.map((s: any) => ({
      id: String(s.id),
      name: s.name,
      kind: "service" as const,
    })),
    ...venues.map((v: any) => ({
      id: String(v.id),
      name: v.name,
      kind: "venue" as const,
    })),
  ];

  return <FoxerPromotionsClient listingOptions={listingOptions} />;
}

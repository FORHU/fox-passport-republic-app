import { requireAnyPermission } from "@/shared/lib/server/auth";
import ProviderMarketplaceRequestsClient from "./_components/ProviderMarketplaceRequestsClient";

// For providers of what an event can pick from the marketplace: venues, gear
// and talent (performers' gigs are services).
export default async function ProviderMarketplaceRequestsPage() {
  await requireAnyPermission([
    "venue:manage",
    "asset:manage",
    "service:manage",
    "performer:manage",
  ]);
  return <ProviderMarketplaceRequestsClient />;
}

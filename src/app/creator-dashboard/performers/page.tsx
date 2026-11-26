export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requirePermission } from "@/shared/lib/server/auth";

/**
 * Performer gigs are a tab of the Services page (app#437): every Provider holds
 * both permissions, so a separate page listed the same gigs twice. The address
 * stays for bookmarks and old links, and opens that tab.
 */
export default async function HostPerformersPage() {
  await requirePermission("performer:manage");
  redirect("/creator-dashboard/services?tab=performers");
}

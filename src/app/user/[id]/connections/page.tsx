import React from "react";
import { requireAuth } from "@/shared/lib/server/auth";
import { ConnectionsPageClient } from "@/features/follow/components/ConnectionsPageClient";

export const dynamic = "force-dynamic";

export default async function UserConnectionsPage() {
  await requireAuth();
  return <ConnectionsPageClient />;
}

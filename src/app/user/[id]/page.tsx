import React from "react";
import { requireAuth } from "@/shared/lib/server/auth";
import PublicCitizenProfileView from "@/features/user/components/PublicCitizenProfileView";

export const dynamic = "force-dynamic";

export default async function UserPublicProfilePage() {
  await requireAuth();
  return <PublicCitizenProfileView />;
}

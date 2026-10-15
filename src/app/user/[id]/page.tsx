import React from "react";
import { requireAuth } from "@/shared/lib/server/auth";
import PublicCitizenProfileClient from "./PublicCitizenProfileClient";

export const dynamic = "force-dynamic";

export default async function UserPublicProfilePage() {
  await requireAuth();
  return <PublicCitizenProfileClient />;
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/lib/server/auth";

export default async function UserAchievementsPage() {
  await requireAuth();
  redirect("/passport/achievements");
}

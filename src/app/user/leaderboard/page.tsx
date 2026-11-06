export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/lib/server/auth";

export default async function UserLeaderboardPage() {
  await requireAuth();
  redirect("/passport/leaderboard");
}

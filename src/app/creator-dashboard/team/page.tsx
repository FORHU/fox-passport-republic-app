export const dynamic = "force-dynamic";

import { requireHost } from "@/shared/lib/server/auth";
import TeamPageClient from "./_components/TeamPageClient";

export default async function TeamPage() {
  // The API decides who may manage each team (only its Mayor or Event Owner);
  // this only keeps the page to people who can own something.
  await requireHost();
  return <TeamPageClient />;
}

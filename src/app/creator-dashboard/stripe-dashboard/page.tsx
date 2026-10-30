import { requirePermission } from "@/shared/lib/server/auth";
import StripeDashboardClient from "./_components/StripeDashboardClient";

// The payout account's dashboard: only for roles the platform pays
// (`payouts:onboard`), as /earnings. It was open to anyone signed in.
export default async function StripeDashboardPage() {
  await requirePermission("payouts:onboard");
  return <StripeDashboardClient />;
}

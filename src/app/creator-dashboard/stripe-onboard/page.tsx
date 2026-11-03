import { requirePermission } from "@/shared/lib/server/auth";
import StripeOnboardClient from "./_components/StripeOnboardClient";

// Payout onboarding is only for roles the platform pays (`payouts:onboard`),
// as /earnings. It was open to anyone signed in.
export default async function StripeOnboardPage() {
  await requirePermission("payouts:onboard");
  return <StripeOnboardClient />;
}

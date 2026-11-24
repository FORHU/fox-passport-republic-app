import { Suspense } from "react";
import type { Metadata } from "next";
import AccountSetupForm from "@/features/auth/components/AccountSetupForm";
import PageLoader from "@/shared/components/ui/PageLoader";
import { requireAuth } from "@/shared/lib/server/auth";

export const metadata: Metadata = {
  title: "Finish setting up your account",
  robots: { index: false, follow: false },
};

// A Google account picks its username and password here before using the app
// (api#419). Signed-out visitors are sent home by the proxy and requireAuth.
export default async function AccountSetupPage() {
  await requireAuth();
  return (
    <Suspense fallback={<PageLoader label="Loading your account" />}>
      <AccountSetupForm />
    </Suspense>
  );
}

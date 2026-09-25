import React from "react";
import OnboardingClient from "@/features/onboarding/components/OnboardingClient";
import { requireAuth } from "@/shared/lib/server/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | FoxPassport",
  description:
    "Begin your journey and choose your identity in the FoxPassport ecosystem.",
};

// One flow at every width. Phones used to get a separate role picker that
// PUT an `intendedRoles` field the api ignores and then went home - so no
// application was ever started from a phone.
export default async function OnboardingPage() {
  const user = await requireAuth();

  return <OnboardingClient user={user} />;
}

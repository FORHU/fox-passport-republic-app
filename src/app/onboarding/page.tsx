import React from 'react';
import OnboardingClient from '@/features/onboarding/components/OnboardingClient';
import MobileRolePicker from '@/features/onboarding/components/MobileRolePicker';
import { requireAuth } from '@/shared/lib/server/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Onboarding | FoxPassport",
  description:
    "Begin your journey and choose your identity in the FoxPassport ecosystem.",
};

export default async function OnboardingPage() {
  const user = await requireAuth();

  return (
    <>
      <div className="lg:hidden">
        <MobileRolePicker />
      </div>
      <div className="hidden lg:block">
        <OnboardingClient user={user} />
      </div>
    </>
  );
}

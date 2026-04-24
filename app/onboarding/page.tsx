import React from 'react';
import OnboardingClient from '@/components/onboarding/OnboardingClient';
import { requireAuth } from '@/lib/server/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onboarding | FoxPassport',
  description: 'Begin your journey and choose your identity in the FoxPassport ecosystem.',
};

export default async function OnboardingPage() {
  const user = await requireAuth();
  
  return <OnboardingClient user={user} />;
}

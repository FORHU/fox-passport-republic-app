import React from 'react';
import FoxerApplicationClient from '@/features/role-application/components/FoxerApplicationClient';
import MobileRoleApplicationForm from '@/features/role-application/components/MobileRoleApplicationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Apply to be a Foxer | FoxPassport",
  description:
    "Apply to become an authorized Service or Equipment Provider on FoxPassport.",
};

export default async function FoxerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === 'asset' ? 'asset' : 'service';
  return (
    <>
      <div className="lg:hidden">
        <MobileRoleApplicationForm />
      </div>
      <div className="hidden lg:block">
        <FoxerApplicationClient initialType={initialType} />
      </div>
    </>
  );
}

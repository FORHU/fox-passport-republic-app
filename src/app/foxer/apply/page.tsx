import React from 'react';
import FoxerApplicationClient from '@/features/role-application/components/FoxerApplicationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to be a Foxer | FoxPassport',
  description: 'Apply to become an authorized Service or Equipment Provider on FoxPassport.',
};

export default async function FoxerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === 'asset' ? 'asset' : 'service';
  return <FoxerApplicationClient initialType={initialType} />;
}

import React from 'react';
import MayorApplicationClient from '@/components/mayor/MayorApplicationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to be a Mayor | FoxPassport',
  description: 'Apply to become an authorized Space Provider (Mayor) on FoxPassport.',
};

export default function MayorApplicationPage() {
  return <MayorApplicationClient />;
}

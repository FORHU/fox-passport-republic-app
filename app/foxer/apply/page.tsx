import React from 'react';
import FoxerApplicationClient from '@/components/foxer/FoxerApplicationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to be a Foxer | FoxPassport',
  description: 'Apply to become an authorized Service or Equipment Provider on FoxPassport.',
};

export default function FoxerApplicationPage() {
  return <FoxerApplicationClient />;
}

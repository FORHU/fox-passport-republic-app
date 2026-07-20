import React from 'react';
import HostApplicationClient from '@/features/role-application/components/HostApplicationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to be an Event Foxer | FoxPassport',
  description: 'Apply to become an authorized Event Foxer on FoxPassport.',
};

export default function HostApplicationPage() {
  return <HostApplicationClient />;
}

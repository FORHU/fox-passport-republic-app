import React from 'react';
import HostApplicationClient from '@/features/role-application/components/HostApplicationClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to be a Host | FoxPassport',
  description: 'Apply to become an authorized Event Creator on FoxPassport.',
};

export default function HostApplicationPage() {
  return <HostApplicationClient />;
}

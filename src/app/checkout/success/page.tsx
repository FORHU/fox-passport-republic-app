import React, { Suspense } from 'react';
import CheckoutSuccessClient from '@/features/booking/components/CheckoutSuccessClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmed | FoxPassport',
  description: 'Your premium venue reservation has been confirmed.',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessClient />
    </Suspense>
  );
}

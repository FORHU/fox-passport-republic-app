import React from 'react';
import CheckoutSuccessClient from '@/components/booking/CheckoutSuccessClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmed | FoxPassport',
  description: 'Your premium venue reservation has been confirmed.',
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />;
}

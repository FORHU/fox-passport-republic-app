import React, { Suspense } from 'react';
import CheckoutSuccessClient from '@/features/booking/components/CheckoutSuccessClient';
import MobileBookingSuccess from '@/features/booking/components/MobileBookingSuccess';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmed | FoxPassport',
  description: 'Your premium venue reservation has been confirmed.',
};

export default function CheckoutSuccessPage() {
  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileBookingSuccess />
      </div>
      {/* Desktop view */}
      <div className="hidden lg:block">
        <Suspense>
          <CheckoutSuccessClient />
        </Suspense>
      </div>
    </>
  );
}

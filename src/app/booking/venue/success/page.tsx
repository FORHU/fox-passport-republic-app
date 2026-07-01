import React, { Suspense } from 'react';
import VenueBookingSuccessClient from '@/features/booking/components/VenueBookingSuccessClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Venue Booking Confirmed | FoxPassport',
  description: 'Your venue booking has been confirmed.',
};

export default function VenueBookingSuccessPage() {
  return (
    <Suspense>
      <VenueBookingSuccessClient />
    </Suspense>
  );
}

import React from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
import { VenueBuilder } from '@/components/mayor/venue-builder';

export default function VenueCreationBuilderPage() {
  return (
    <RequireAuth>
      <VenueBuilder />
    </RequireAuth>
  );
}

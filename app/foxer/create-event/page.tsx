import React from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
import { EventBuilder } from '@/components/foxer/event-builder';

export default function EventCreationBuilderPage() {
  return (
    <RequireAuth>
      <EventBuilder />
    </RequireAuth>
  );
}

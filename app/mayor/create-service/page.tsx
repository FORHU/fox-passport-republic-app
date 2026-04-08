import React, { Suspense } from 'react';
import RequireAuth from '@/components/authentication/RequireAuth';
import { ServiceBuilder } from '@/components/mayor/service-builder';

export default function ServiceBuilderPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="fixed inset-0 bg-[#02040a] flex items-center justify-center"><span className="text-white">Loading...</span></div>}>
        <ServiceBuilder />
      </Suspense>
    </RequireAuth>
  );
}

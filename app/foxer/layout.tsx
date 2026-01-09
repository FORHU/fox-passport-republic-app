"use client";

import React from 'react';
import RequireAuth from "@/components/authentication/RequireAuth";

export default function FoxerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  );
}
"use client";

import React from "react";
import CreateVenueWizard from "@/components/mayor/CreateVenueWizard";
import { useCreateVenueModal } from "@/hooks/venues/useCreateVenueModal";
import RequireAuth from "@/components/authentication/RequireAuth";

/**
 * Host layout - wraps all host dashboard pages
 *
 * Auth & role checks are handled by proxy.ts
 * This layout only manages UI state (create venue modal)
 */
export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useCreateVenueModal();

  return (
    <RequireAuth>
      {children}
      {isOpen && <CreateVenueWizard />}
    </RequireAuth>
  );
}

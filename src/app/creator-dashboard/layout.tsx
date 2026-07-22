"use client";

import React from "react";
import CreateVenueWizard from "@/features/venue/components/CreateVenueWizard";
import { useCreateVenueModal } from "@/features/venue/hooks/useCreateVenueModal";
import RequireAuth from "@/features/auth/components/RequireAuth";

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
      <div className="pb-16 md:pb-0">
        {children}
      </div>
      {isOpen && <CreateVenueWizard />}
    </RequireAuth>
  );
}

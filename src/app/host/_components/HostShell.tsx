"use client";

import React from "react";
import CreateVenueWizard from "@/features/venue/components/CreateVenueWizard";
import { useCreateVenueModal } from "@/features/venue/hooks/useCreateVenueModal";

/** UI-only chrome for the /host tree: the create-venue modal. Auth lives in the layout. */
export default function HostShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useCreateVenueModal();

  return (
    <>
      {children}
      {isOpen && <CreateVenueWizard />}
    </>
  );
}

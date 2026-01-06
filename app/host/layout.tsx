"use client";

import React from "react";
import CreateVenueWizard from "@/components/host/CreateVenueWizard";
import { useCreateVenueModal } from "@/hooks/useCreateVenueModal";
import RequireAuth from "@/components/authentication/RequireAuth";

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

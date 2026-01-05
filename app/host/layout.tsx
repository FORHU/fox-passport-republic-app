"use client";

import React from "react";
import CreateVenueWizard from "@/components/host/CreateVenueWizard";
import { useCreateVenueModal } from "@/hooks/useCreateVenueModal";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useCreateVenueModal();

  return (
    <>
      {children}
      {isOpen && <CreateVenueWizard />}
    </>
  );
}

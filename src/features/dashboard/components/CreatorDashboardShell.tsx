"use client";

import React from "react";
import CreateVenueWizard from "@/features/venue/components/CreateVenueWizard";
import { useCreateVenueModal } from "@/features/venue/hooks/useCreateVenueModal";
import RequireAuth from "@/features/auth/components/RequireAuth";

/**
 * The client half of the creator dashboard layout: the create-venue modal
 * state, and nothing else.
 *
 * It was split out of `app/creator-dashboard/layout.tsx` so that layout could
 * become a server component and run `requireAuth()` before rendering, the way
 * every other protected tree does. A layout cannot be both, and owning
 * `useCreateVenueModal` made this one a client component by force.
 *
 * `RequireAuth` stays even though the server guard is stronger: the server
 * check runs on a request, and this one covers a session dying part-way
 * through a client-side navigation - and it is what opens the signup modal,
 * which a server `redirect("/")` cannot do.
 */
export default function CreatorDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useCreateVenueModal();

  return (
    <RequireAuth>
      <div className="pb-16 md:pb-0">{children}</div>
      {isOpen && <CreateVenueWizard />}
    </RequireAuth>
  );
}

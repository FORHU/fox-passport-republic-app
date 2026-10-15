"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthLoading,
  useAuthStatus,
  useAuthStore,
} from "@/shared/auth/useAuthStore"; // Import store
import PageLoader from "@/shared/components/ui/PageLoader";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RequireAuth({
  children,
  redirectTo = "/",
}: RequireAuthProps) {
  const isAuthenticated = useAuthStatus();
  const isLoading = useAuthLoading();
  const router = useRouter();

  // Get the action to open the login modal
  const openLogin = useAuthStore((state) => state.openLogin);

  useEffect(() => {
    // If we are done loading AND the user is NOT logged in
    if (!isLoading && !isAuthenticated) {
      // 1. Open the Login modal immediately
      openLogin();

      // 2. Redirect them to Home (so the modal shows up over the home page)
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router, openLogin]);

  // Show spinner while deciding
  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  // If not authenticated, return null so they don't see the protected content for a split second
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, show the page
  return <>{children}</>;
}

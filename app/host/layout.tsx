"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CreateVenueWizard from "@/components/mayor/CreateVenueWizard";
import { useCreateVenueModal } from "@/hooks/venues/useCreateVenueModal";
import RequireAuth from "@/components/authentication/RequireAuth";
import { useAuthStore } from "@/store/useAuthStore";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useCreateVenueModal();
  const { isAuthenticated, user, isLoading, openLogin } = useAuthStore();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // If not authenticated, redirect to home and open login modal
    if (!isAuthenticated) {
      if (!hasShownToast.current) {
        toast.error("Please log in to access the host dashboard");
        hasShownToast.current = true;
      }
      router.push("/");
      setTimeout(() => {
        openLogin();
      }, 100);
      return;
    }

    // If authenticated but not a host, redirect to home with toast
    // Check both isHost boolean and role field for host access
    const isHostUser = user?.isHost || user?.role === "host" || user?.role === "admin" || user?.role === "super_admin";
    if (user && !isHostUser) {
      if (!hasShownToast.current) {
        toast.error("Only hosts can access this page. Become a mayor to continue!");
        hasShownToast.current = true;
      }
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, isLoading, router, openLogin]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not a host
  // Check both isHost boolean and role field for host access
  const canAccessHost = user?.isHost || user?.role === "host" || user?.role === "admin" || user?.role === "super_admin";
  if (!isAuthenticated || !user || !canAccessHost) {
    return null;
  }

  return (
    <RequireAuth>
      {children}
      {isOpen && <CreateVenueWizard />}
    </RequireAuth>
  );
}

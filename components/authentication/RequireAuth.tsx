"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthLoading, useAuthStatus, useAuthStore } from "@/store/useAuthStore"; // Import store
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RequireAuth({ children, redirectTo = "/" }: RequireAuthProps) {
  const isAuthenticated = useAuthStatus();
  const isLoading = useAuthLoading();
  const router = useRouter();
  
  // Get the action to open the signup modal
  const openSignup = useAuthStore((state) => state.openSignup); 

  useEffect(() => {
    // If we are done loading AND the user is NOT logged in
    if (!isLoading && !isAuthenticated) {
      
      // 1. Open the Signup Modal immediately
      openSignup();

      // 2. Redirect them to Home (so the modal shows up over the home page)
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router, openSignup]);

  // Show spinner while deciding
  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-pink-600" size={30} />
        </div>
    );
  }

  // If not authenticated, return null so they don't see the protected content for a split second
  if (!isAuthenticated) {
    return null; 
  }

  // If authenticated, show the page
  return <>{children}</>;
}
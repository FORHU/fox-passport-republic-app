"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Single source of truth for session hydration
    initialize();
  }, [initialize]);

  // While checking, show a theme-consistent loader
  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0f111a]">
            <Loader2 className="animate-spin text-[#ccff00]" size={40} />
        </div>
    );
  }

  // Once done, show the app
  return <>{children}</>;
}
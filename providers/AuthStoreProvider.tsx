"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { useSessionManager } from "@/hooks/auth/useSessionManager";
import SessionTimeoutModal from "@/components/shared/SessionTimeoutModal";

function SessionManager() {
  const [showWarning, setShowWarning] = useState(false);

  useSessionManager(
    () => setShowWarning(true),
    () => setShowWarning(false),
  );

  const handleLogout = () => {
    setShowWarning(false);
    useAuthStore.getState().logout();
    window.location.href = "/";
  };

  return (
    <SessionTimeoutModal
      isOpen={showWarning}
      onStayLoggedIn={() => setShowWarning(false)}
      onLogout={handleLogout}
    />
  );
}

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f111a]">
        <Loader2 className="animate-spin text-[#ccff00]" size={40} />
      </div>
    );
  }

  return (
    <>
      <SessionManager />
      {children}
    </>
  );
}
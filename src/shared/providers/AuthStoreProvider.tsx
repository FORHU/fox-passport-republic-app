"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { useSessionManager } from "@/features/auth/hooks/useSessionManager";
import SessionTimeoutModal from "@/shared/components/layout/SessionTimeoutModal";
import { setAuthCookies } from "@/shared/lib/server/auth-actions";

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

    // Re-sync auth cookies on every mount so server components can read the token.
    // Handles users who logged in before cookies were introduced, or whose cookies expired.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("fox_token");
      const refresh = localStorage.getItem("fox_refresh_token");
      const userStr = localStorage.getItem("fox_user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuthCookies({
            accessToken: token,
            refreshToken: refresh ?? "",
            user,
          }).catch(() => {});
        } catch {
          // ignore malformed localStorage data
        }
      }
    }
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
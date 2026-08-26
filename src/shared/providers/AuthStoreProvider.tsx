"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { useSessionManager } from "@/features/auth/hooks/useSessionManager";
import SessionTimeoutModal from "@/shared/components/layout/SessionTimeoutModal";

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

    // Purge legacy tokens.
    //
    // This used to read fox_token / fox_refresh_token out of localStorage and
    // push them back into cookies on every mount. That made sense when the
    // client held the tokens; it does not now, and it would quietly re-admit a
    // token to the cookie jar from a script-readable source.
    //
    // Anyone who signed in before tokens moved to httpOnly cookies still has
    // them sitting in their browser, readable by any script on the page, with
    // nothing to remove them. Clearing here means those copies disappear on the
    // user's next visit rather than lingering until the keys are overwritten.
    //
    // fox_user is deliberately left alone: it is profile display data, carries
    // no token, and is what rehydrates the session optimistically.
    if (typeof window !== "undefined") {
      localStorage.removeItem("fox_token");
      localStorage.removeItem("fox_refresh_token");
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

"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAccountChange, useAuthStore } from "@/shared/auth/useAuthStore";
import { useSessionManager } from "@/shared/auth/useSessionManager";
import SessionTimeoutModal from "@/shared/components/layout/SessionTimeoutModal";
import { endSession } from "@/shared/auth/endSession";

function SessionManager() {
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useSessionManager(
    () => setShowWarning(true),
    () => setShowWarning(false),
  );

  const handleLogout = async () => {
    // The modal stays up, in a pending state, rather than closing first: this
    // awaits a round trip to /auth/logout, and dismissing the dialog before it
    // returns left the user looking at an unchanged page with nothing to say
    // the click had registered.
    setIsLoggingOut(true);
    await endSession();
    // Same `?auth=expired` handoff as the idle-timeout and 401-interceptor
    // paths: `SessionExpiredToast` picks it up after reload and opens the
    // login modal, rather than landing on a bare home page.
    window.location.href = "/?auth=expired";
  };

  return (
    <SessionTimeoutModal
      isOpen={showWarning}
      isLoggingOut={isLoggingOut}
      onStayLoggedIn={() => setShowWarning(false)}
      onLogout={handleLogout}
    />
  );
}

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const queryClient = useQueryClient();

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
      // The Stripe account id the embedded dashboard used to send; the API
      // decides whose account it opens now.
      localStorage.removeItem("fox_stripe_account_id");
    }
  }, [initialize]);

  // The previous account's cached responses go whenever the account changes,
  // however that was noticed: a sign-in over it, a social callback, a profile
  // poll finding someone else's session, a sign-out. Switching to someone
  // refetches what's on screen for them; signing out only drops it, since a
  // refetch with no session would just 401.
  useEffect(
    () =>
      onAccountChange(() => {
        if (useAuthStore.getState().user) void queryClient.resetQueries();
        else queryClient.clear();
      }),
    [queryClient],
  );

  // Another tab signed in as someone else, or out. The session cookie is
  // shared, so this tab is now that account too: reload, rather than go on
  // showing the previous one with its data still in memory (BUG-07).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "fox_user") return;
      let next: string | undefined;
      try {
        next = e.newValue ? JSON.parse(e.newValue)?.id : undefined;
      } catch {
        next = undefined;
      }
      if (next !== useAuthStore.getState().user?.id) window.location.reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Children render while the session loads. This used to return a full-screen
  // spinner instead, and since `isLoading` is always true on the server, every
  // page's HTML was that spinner: no headings, text or JSON-LD for crawlers or
  // link previews. Pages that need a user wait on their own (RequireAuth,
  // AdminAuthGuard and the server-side requireAuth all check loading).
  return (
    <>
      {!isLoading && <SessionManager />}
      {children}
    </>
  );
}

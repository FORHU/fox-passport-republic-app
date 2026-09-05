/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { PROFILE_QUERY_KEY, fetchProfile } from "@/shared/auth/profile";

const IDLE_WARN_MS = 2 * 60 * 60 * 1000; // show warning at 2 hours idle
const IDLE_LOGOUT_MS = 24 * 60 * 60 * 1000; // auto-logout at 24 hours idle (effectively disabled)
export function useSessionManager(
  onShowWarning: () => void,
  onDismissWarning: () => void,
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // --- PERIODIC PROFILE REFETCH (for role updates) ---
  useQuery({
    // Same key and same fetcher as useProfile, so the settings page and this
    // poller share one request and one cached profile.
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    // Gated on the session flag only. It used to also require a client-side
    // accessToken, which is now always null because the token is httpOnly -
    // that condition would have silently switched role polling off.
    enabled: isAuthenticated,
    retry: false,
    // Roles change when an admin approves a role application, and the server now
    // emits `roles` to that user the moment it happens - this interval is the
    // recovery path for a dropped socket, not how the change arrives.
    refetchInterval: () => {
      if (typeof document !== "undefined" && document.hidden) return false;
      return 5 * 60 * 1000;
    },
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });

  // Keep callback refs stable so event listeners don't churn
  const onShowWarningRef = useRef(onShowWarning);
  const onDismissWarningRef = useRef(onDismissWarning);
  // Assigned in an effect, not during render: writing a ref while rendering is
  // unsafe under concurrent rendering, and the linter now flags it.
  useEffect(() => {
    onShowWarningRef.current = onShowWarning;
    onDismissWarningRef.current = onDismissWarning;
  }, [onShowWarning, onDismissWarning]);

  const idleWarnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleLogoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimers = useCallback(() => {
    if (idleWarnTimer.current) {
      clearTimeout(idleWarnTimer.current);
      idleWarnTimer.current = null;
    }
    if (idleLogoutTimer.current) {
      clearTimeout(idleLogoutTimer.current);
      idleLogoutTimer.current = null;
    }
  }, []);

  const doLogout = useCallback(() => {
    clearIdleTimers();
    useAuthStore.getState().logout();
    window.location.href = "/?auth=expired";
  }, [clearIdleTimers]);

  const resetIdleTimers = useCallback(() => {
    if (!useAuthStore.getState().isAuthenticated) return;
    clearIdleTimers();
    onDismissWarningRef.current();
    idleWarnTimer.current = setTimeout(
      () => onShowWarningRef.current(),
      IDLE_WARN_MS,
    );
    // idleLogoutTimer.current = setTimeout(doLogout, IDLE_LOGOUT_MS); // Disabled forced idle logout per requirements
  }, [clearIdleTimers, doLogout]);

  // Idle detection
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    activityEvents.forEach((e) =>
      window.addEventListener(e, resetIdleTimers, { passive: true }),
    );
    resetIdleTimers();

    return () => {
      activityEvents.forEach((e) =>
        window.removeEventListener(e, resetIdleTimers),
      );
      clearIdleTimers();
    };
  }, [isAuthenticated, resetIdleTimers, clearIdleTimers]);

  // Token refresh is no longer scheduled here.
  //
  // This used to decode the JWT to find its expiry and refresh two minutes
  // early, which required both the access token and the refresh token in
  // localStorage. They are httpOnly cookies now, so the client can neither read
  // the expiry nor perform the refresh - and does not need to. The proxy route
  // refreshes on a 401 and replays the request server-side, so an expired token
  // costs one extra hop and is invisible to the user, rather than being
  // something the client has to predict.
}

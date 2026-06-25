"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/axios";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/useAuthStore";

const IDLE_WARN_MS = 2 * 60 * 60 * 1000;        // show warning at 2 hours idle
const IDLE_LOGOUT_MS = 24 * 60 * 60 * 1000;      // auto-logout at 24 hours idle (effectively disabled)
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // refresh 2 min before token expires

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useSessionManager(onShowWarning: () => void, onDismissWarning: () => void) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);

  // --- PERIODIC PROFILE REFETCH (for role updates) ---
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get("/profile");
      const freshUser = response.data?.data || response.data;
      if (freshUser) {
        // Update store with fresh user data (roles, etc)
        useAuthStore.getState().setUser(freshUser);
      }
      return freshUser;
    },
    enabled: isAuthenticated,
    refetchInterval: (query) => {
       if (typeof document !== 'undefined' && document.hidden) return false;
       return 30000; // Refetch profile every 30 seconds
    },
    staleTime: 10000,
  });

  // Keep callback refs stable so event listeners don't churn
  const onShowWarningRef = useRef(onShowWarning);
  const onDismissWarningRef = useRef(onDismissWarning);
  onShowWarningRef.current = onShowWarning;
  onDismissWarningRef.current = onDismissWarning;

  const idleWarnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleLogoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const proactiveRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdleTimers = useCallback(() => {
    if (idleWarnTimer.current) { clearTimeout(idleWarnTimer.current); idleWarnTimer.current = null; }
    if (idleLogoutTimer.current) { clearTimeout(idleLogoutTimer.current); idleLogoutTimer.current = null; }
  }, []);

  const doLogout = useCallback(() => {
    clearIdleTimers();
    if (proactiveRefreshTimer.current) { clearTimeout(proactiveRefreshTimer.current); proactiveRefreshTimer.current = null; }
    useAuthStore.getState().logout();
    window.location.href = "/?auth=expired";
  }, [clearIdleTimers]);

  const resetIdleTimers = useCallback(() => {
    if (!useAuthStore.getState().isAuthenticated) return;
    clearIdleTimers();
    onDismissWarningRef.current();
    idleWarnTimer.current = setTimeout(() => onShowWarningRef.current(), IDLE_WARN_MS);
    // idleLogoutTimer.current = setTimeout(doLogout, IDLE_LOGOUT_MS); // Disabled forced idle logout per requirements
  }, [clearIdleTimers, doLogout]);

  const scheduleProactiveRefresh = useCallback((token: string) => {
    if (proactiveRefreshTimer.current) { clearTimeout(proactiveRefreshTimer.current); proactiveRefreshTimer.current = null; }

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const refreshIn = expiry - Date.now() - REFRESH_BEFORE_EXPIRY_MS;
    if (refreshIn <= 0) return;

    proactiveRefreshTimer.current = setTimeout(async () => {
      const storedRefreshToken = localStorage.getItem("fox_refresh_token");
      if (!storedRefreshToken) return;

      try {
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh-token`, {
          refreshToken: storedRefreshToken.replace(/"/g, ""),
        });

        const { accessToken: newToken, user } = data;
        localStorage.setItem("fox_token", newToken);
        if (user) localStorage.setItem("fox_user", JSON.stringify({ ...user, accessToken: newToken }));

        // Update store so next scheduleProactiveRefresh fires correctly
        useAuthStore.setState({ accessToken: newToken });

        scheduleProactiveRefresh(newToken);
      } catch {
        // Silent — the reactive 401 interceptor in axios.ts handles failures
      }
    }, refreshIn);
  }, []);

  // Idle detection
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((e) => window.addEventListener(e, resetIdleTimers, { passive: true }));
    resetIdleTimers();

    return () => {
      activityEvents.forEach((e) => window.removeEventListener(e, resetIdleTimers));
      clearIdleTimers();
    };
  }, [isAuthenticated, resetIdleTimers, clearIdleTimers]);

  // Proactive token refresh
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    scheduleProactiveRefresh(accessToken);

    return () => {
      if (proactiveRefreshTimer.current) { clearTimeout(proactiveRefreshTimer.current); proactiveRefreshTimer.current = null; }
    };
  }, [isAuthenticated, accessToken, scheduleProactiveRefresh]);
}

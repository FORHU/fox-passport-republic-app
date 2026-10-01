"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";

// Below this, a load is fast enough (a cached page, a cache hit) that showing
// anything would only be a flicker.
const SHOW_DELAY_MS = 150;
// Only a fallback for a navigation that never lands (redirected away,
// cancelled) — the bar normally clears the moment the URL changes.
const NAV_TIMEOUT_MS = 8000;

// Patches `router.push`/`router.replace` on the singleton object
// `useRouter()` returns — `<Link>` calls the exact same object internally,
// so one patch covers both Link clicks and every direct router.push() /
// replace(). Patching at the call site (rather than `history.pushState`,
// which Next calls from inside a `useInsertionEffect` where React forbids
// state updates) means `start()` runs from a plain click handler.
function patchRouter(
  router: ReturnType<typeof useRouter>,
  isSameUrl: (href: string) => boolean,
  start: () => void,
) {
  const originalPush = router.push.bind(router);
  const originalReplace = router.replace.bind(router);

  router.push = ((...args: Parameters<typeof originalPush>) => {
    const href = args[0];
    if (typeof href !== "string" || !isSameUrl(href)) start();
    return originalPush(...args);
  }) as typeof router.push;

  router.replace = ((...args: Parameters<typeof originalReplace>) => {
    const href = args[0];
    if (typeof href !== "string" || !isSameUrl(href)) start();
    return originalReplace(...args);
  }) as typeof router.replace;

  return () => {
    router.push = originalPush;
    router.replace = originalReplace;
  };
}

/**
 * A thin bar along the top of the viewport while something is actually
 * loading: a navigation in flight, or a query fetching data the screen
 * doesn't have yet. It replaces a full-screen overlay that showed on every
 * navigation for a fixed minimum time and blocked every click — even when
 * the next page came straight from cache. Background refetches of data
 * already on screen don't count; that's the point of caching it.
 */
export default function RouteProgressBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [visible, setVisible] = useState(false);

  // Queries with no data yet — the ones whose screen is showing a spinner
  // or a skeleton right now.
  const firstLoads = useIsFetching({
    predicate: (query) => query.state.status === "pending",
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = `${pathname}?${searchParams.toString()}`;
  const keyRef = useRef(key);

  const finish = useCallback(() => {
    setNavigating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setNavigating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(finish, NAV_TIMEOUT_MS);
  }, [finish]);

  // Navigation landed — the URL actually changed.
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      finish();
    }
  }, [key, finish]);

  useEffect(() => {
    // A push/replace to the URL the browser is already on never changes
    // pathname/searchParams, so it would never "land" — don't start for it.
    const isSameUrl = (href: string) => {
      try {
        const target = new URL(href, window.location.href);
        return (
          target.pathname + target.search ===
          window.location.pathname + window.location.search
        );
      } catch {
        return false;
      }
    };

    const restoreRouter = patchRouter(router, isSameUrl, start);
    const onPopState = () => start();
    window.addEventListener("popstate", onPopState);

    return () => {
      restoreRouter();
      window.removeEventListener("popstate", onPopState);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router, start]);

  const busy = navigating || firstLoads > 0;
  useEffect(() => {
    if (!busy) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [busy]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden bg-accent/15"
    >
      <div className="route-progress-indicator h-full w-1/3 bg-accent shadow-[0_0_8px_var(--color-accent)]" />
    </div>
  );
}

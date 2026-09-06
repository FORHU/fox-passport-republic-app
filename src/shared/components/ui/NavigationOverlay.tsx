"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 200;
const MAX_VISIBLE_MS = 6000;

// Full-screen blocking overlay shown while a navigation is in flight — sits
// above everything and swallows clicks so the user can't act on a page
// that's about to be replaced.
//
// This patches `router.push`/`router.replace` on the singleton object
// `useRouter()` returns — `<Link>` calls the exact same object internally,
// so one patch here covers both Link clicks and the ~63 files that call
// router.push()/replace() directly. That's deliberate: an earlier version
// patched `history.pushState` instead, but Next's own router calls that
// from inside a `useInsertionEffect` (see HistoryUpdater in app-router.js),
// where React forbids scheduling state updates — patching at the router
// call site instead means `start()` runs from a plain click handler, well
// before Next's internal transition even begins.
export default function NavigationOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef<number>(0);
  const activeRef = useRef(false);

  const key = `${pathname}?${searchParams.toString()}`;
  const keyRef = useRef(key);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setVisible(false), wait);
  }, []);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    shownAtRef.current = Date.now();
    setVisible(true);

    // Safety net: a push/replace to the same URL, or one that never
    // resolves (redirected away, cancelled), never trips the pathname
    // effect below, so without this the overlay could block forever.
    if (safetyRef.current) clearTimeout(safetyRef.current);
    safetyRef.current = setTimeout(finish, MAX_VISIBLE_MS);
  }, [finish]);

  // Navigation completed — the URL actually changed.
  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      finish();
    }
  }, [key, finish]);

  // Intentional: `router` is Next's long-lived AppRouterInstance, not a
  // React-tracked value — patching its methods (rather than duplicating
  // Next's internal navigation logic) is the only way to observe every
  // push/replace call site, matching the pattern Next itself uses to patch
  // history.pushState/replaceState on mount.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    const originalPush = router.push.bind(router);
    const originalReplace = router.replace.bind(router);

    // A push/replace to the URL the browser is already on never changes
    // pathname/searchParams, so the "navigation completed" effect above
    // never fires and the overlay would otherwise sit blocking every click
    // for the full MAX_VISIBLE_MS safety window instead of the real ~200ms.
    // Skipping `start()` entirely for a same-URL call (e.g. re-clicking an
    // already-active filter tab) avoids ever showing it for a navigation
    // that was never going anywhere.
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

    const onPopState = () => start();
    window.addEventListener("popstate", onPopState);

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      window.removeEventListener("popstate", onPopState);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, [router, start]);
  /* eslint-enable react-hooks/immutability */

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#02040a]/70 backdrop-blur-sm"
      // Blocks every interaction underneath while a navigation is pending.
      onClick={(e) => e.preventDefault()}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="h-10 w-10 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { getNewPostsCount } from "@/shared/api/feed";
import { SOCKET_EVENTS, subscribeRealtime } from "@/shared/lib/realtime";
import { getSocket } from "@/shared/lib/socket";
import type { FeedTab } from "@/features/republic/types";

/** How often to ask while the socket can't tell us (signed out, or dropped). */
export const NEW_POSTS_POLL_MS = 60_000;
/** A burst of posts becomes one count request. */
const SOCKET_COALESCE_MS = 1_500;

/**
 * How many posts the viewer may see were created after `since` on `tab`,
 * for the feed's "New posts" pill (app#308).
 *
 * The server announces every public post over the socket (`feed:new`, tab
 * only); that triggers a count request, which applies the viewer's own
 * visibility rules and leaves out their own posts. Without a live socket, it
 * polls every minute while the page is visible. Returns 0 while disabled or
 * until `since` is known, and starts again from 0 whenever `since` or `tab`
 * changes.
 */
export function useNewPostsCount(
  since: string | null,
  tab: FeedTab,
  enabled: boolean,
): number {
  const [count, setCount] = useState(0);
  const coalesceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCount(0);
    if (!enabled || !since) return;

    let cancelled = false;
    const check = () => {
      getNewPostsCount({ since, tab })
        .then((n) => {
          if (!cancelled) setCount(n);
        })
        .catch(() => {
          // Best-effort: the next event or poll tries again.
        });
    };

    const unsubscribe = subscribeRealtime<{ tab?: string }>(
      SOCKET_EVENTS.FEED_NEW,
      (payload) => {
        if (tab !== "all" && payload?.tab !== tab) return;
        if (coalesceRef.current) clearTimeout(coalesceRef.current);
        coalesceRef.current = setTimeout(check, SOCKET_COALESCE_MS);
      },
    );

    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (getSocket()?.connected) return; // the socket tells us instead
      check();
    }, NEW_POSTS_POLL_MS);

    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(timer);
      if (coalesceRef.current) clearTimeout(coalesceRef.current);
    };
  }, [since, tab, enabled]);

  return count;
}

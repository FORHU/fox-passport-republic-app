"use client";

import { useCallback, useEffect, useRef } from "react";
import { recordPostViews } from "@/shared/api/feed";
import { onAccountChange } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "../store/usePostStatsStore";

/** A post counts as seen once at least this much of it is on screen… */
export const VIEW_VISIBLE_RATIO = 0.5;
/** …for this long without leaving. */
export const VIEW_DWELL_MS = 1000;
/** Seen ids are sent together, at most this often. */
export const VIEW_FLUSH_MS = 5000;
/** Matches the API's per-request cap. */
export const VIEW_BATCH_MAX = 50;

// Module-level so every card shares one observer, one queue and one record of
// what was already sent this session. The server dedupes per (post, viewer)
// too; `sent` only saves the round trip.
const queue = new Set<string>();
const sent = new Set<string>();
const watched = new Map<
  Element,
  { ids: string[]; timer: ReturnType<typeof setTimeout> | null }
>();
let observer: IntersectionObserver | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.size === 0) return;
  const batch = [...queue].slice(0, VIEW_BATCH_MAX);
  batch.forEach((id) => {
    queue.delete(id);
    sent.add(id);
  });
  if (queue.size > 0) scheduleFlush();
  try {
    const recorded = await recordPostViews(batch);
    const { adjustCount } = usePostStatsStore.getState();
    recorded.forEach((id) => adjustCount(id, "viewsCount", 1));
  } catch {
    // A lost view isn't worth retrying or telling anyone about.
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => void flush(), VIEW_FLUSH_MS);
}

function markSeen(el: Element) {
  const entry = watched.get(el);
  if (!entry) return;
  entry.ids.forEach((id) => {
    if (!sent.has(id)) queue.add(id);
  });
  observer?.unobserve(el);
  watched.delete(el);
  if (queue.size > 0) scheduleFlush();
}

function getObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const entry = watched.get(e.target);
        if (!entry) continue;
        const visible =
          e.isIntersecting && e.intersectionRatio >= VIEW_VISIBLE_RATIO;
        if (visible && !entry.timer) {
          entry.timer = setTimeout(() => markSeen(e.target), VIEW_DWELL_MS);
        } else if (!visible && entry.timer) {
          clearTimeout(entry.timer);
          entry.timer = null;
        }
      }
    },
    { threshold: [0, VIEW_VISIBLE_RATIO] },
  );
  if (typeof document !== "undefined") {
    // Leaving the tab sends what's queued instead of waiting for the timer.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") void flush();
    });
  }
  return observer;
}

function unwatch(el: Element) {
  const entry = watched.get(el);
  if (entry?.timer) clearTimeout(entry.timer);
  watched.delete(el);
  observer?.unobserve(el);
}

// Views belong to one viewer: a different account starts from nothing.
onAccountChange(() => {
  queue.clear();
  sent.clear();
});

/**
 * Counts a view of `postIds` once the element this ref is attached to has been
 * at least half on screen for a second. Pass `enabled: false` for signed-out
 * viewers and for the viewer's own post. A repost passes its own id and its
 * original's, so both get the view.
 */
export function usePostViewTracker(postIds: string[], enabled: boolean) {
  const elRef = useRef<Element | null>(null);
  const key = postIds.join(",");

  const attach = useCallback(
    (el: Element | null) => {
      if (elRef.current) unwatch(elRef.current);
      elRef.current = el;
      if (!el || !enabled) return;
      const ids = key.split(",").filter((id) => id && !sent.has(id));
      if (ids.length === 0) return;
      const obs = getObserver();
      if (!obs) return;
      watched.set(el, { ids, timer: null });
      obs.observe(el);
    },
    [key, enabled],
  );

  useEffect(
    () => () => {
      if (elRef.current) unwatch(elRef.current);
    },
    [],
  );

  return attach;
}

/** Test-only: forget all module state. */
export function __resetPostViewTracker() {
  watched.forEach((_, el) => unwatch(el));
  queue.clear();
  sent.clear();
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  observer?.disconnect();
  observer = null;
}

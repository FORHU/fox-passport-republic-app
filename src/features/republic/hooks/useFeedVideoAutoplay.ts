"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFeedVideoSound } from "../store/useFeedVideoSound";

/** A feed video plays once at least this much of it is on screen. */
export const PLAY_VISIBLE_RATIO = 0.5;

// Module-level so every card shares one observer and only one video plays at
// a time: the most visible one. Same shape as usePostViewTracker.
const ratios = new Map<HTMLVideoElement, number>();
let observer: IntersectionObserver | null = null;
/** Open overlays (the viewer, the post detail) pausing the feed. */
let suspended = 0;

/**
 * Autoplay is skipped where it isn't wanted or can't work: the device asks for
 * reduced motion, the browser is saving data, or there's no
 * IntersectionObserver (old browsers, tests). The play badge shows instead.
 */
export function canAutoplay(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof IntersectionObserver === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return !connection?.saveData;
}

function play(el: HTMLVideoElement) {
  if (!el.paused) return;
  el.play()?.catch((error: unknown) => {
    // Sound without a recent tap can be refused: fall back to muted, which
    // browsers always allow, and say so on the volume button.
    if ((error as { name?: string })?.name === "NotAllowedError" && !el.muted) {
      el.muted = true;
      useFeedVideoSound.getState().setMuted(true);
      el.play()?.catch(() => {});
    }
  });
}

/** Plays the most visible video (≥ half on screen) and pauses every other. */
function pick() {
  let best: HTMLVideoElement | null = null;
  const active =
    suspended === 0 &&
    (typeof document === "undefined" || document.visibilityState !== "hidden");
  if (active) {
    let bestRatio = 0;
    for (const [el, ratio] of ratios) {
      if (ratio < PLAY_VISIBLE_RATIO) continue;
      // Equally visible: the one nearer the top of the screen wins.
      const better =
        !best ||
        ratio > bestRatio ||
        (ratio === bestRatio &&
          Math.abs(el.getBoundingClientRect().top) <
            Math.abs(best.getBoundingClientRect().top));
      if (better) {
        best = el;
        bestRatio = ratio;
      }
    }
  }
  for (const el of ratios.keys()) {
    if (el !== best && !el.paused) el.pause();
  }
  if (best) play(best);
}

function getObserver(): IntersectionObserver | null {
  if (observer) return observer;
  if (typeof IntersectionObserver === "undefined") return null;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLVideoElement;
        if (!ratios.has(el)) continue;
        ratios.set(el, e.isIntersecting ? e.intersectionRatio : 0);
      }
      pick();
    },
    { threshold: [0, 0.25, PLAY_VISIBLE_RATIO, 0.75, 1] },
  );
  if (typeof document !== "undefined") {
    // Another tab or app in front: pause; back again: resume.
    document.addEventListener("visibilitychange", pick);
  }
  return observer;
}

function unwatch(el: HTMLVideoElement) {
  if (!ratios.has(el)) return;
  ratios.delete(el);
  observer?.unobserve(el);
  if (!el.paused) el.pause();
  pick();
}

/**
 * Plays a feed video by itself while it's the most visible one on screen,
 * muted at first and looping. Attach `ref` to the `<video>`. `autoplaying`
 * is false when `enabled` is off or autoplay is skipped (see canAutoplay);
 * the video then stays a still frame as before.
 */
export function useFeedVideoAutoplay(enabled: boolean) {
  const elRef = useRef<HTMLVideoElement | null>(null);
  // Decided after mount: the server can't know the viewer's settings.
  const [autoplaying, setAutoplaying] = useState(false);
  useEffect(() => {
    setAutoplaying(enabled && canAutoplay());
  }, [enabled]);

  const ref = useCallback(
    (el: HTMLVideoElement | null) => {
      if (elRef.current) unwatch(elRef.current);
      elRef.current = el;
      if (!el || !autoplaying) return;
      const obs = getObserver();
      if (!obs) return;
      ratios.set(el, 0);
      obs.observe(el);
    },
    [autoplaying],
  );

  useEffect(
    () => () => {
      if (elRef.current) unwatch(elRef.current);
    },
    [],
  );

  return { ref, autoplaying };
}

/**
 * Pauses every feed video while `active` (an overlay such as the full-screen
 * viewer or the post detail is open), and resumes the most visible one after.
 */
export function useSuspendFeedAutoplay(active: boolean) {
  useEffect(() => {
    if (!active) return;
    suspended += 1;
    pick();
    return () => {
      suspended -= 1;
      pick();
    };
  }, [active]);
}

/** Test-only: forget all module state. */
export function __resetFeedVideoAutoplay() {
  ratios.clear();
  suspended = 0;
  observer?.disconnect();
  observer = null;
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", pick);
  }
}

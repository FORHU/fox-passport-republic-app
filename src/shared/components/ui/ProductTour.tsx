"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export interface TourStep {
  /** Value of the `data-tour` attribute on the element to point at. Leave it
   * out for a centred step (an intro or a sign-off). A step whose element is
   * not on the page — a section this role doesn't have, or one hidden at this
   * screen size — is skipped rather than shown pointing at nothing. */
  target?: string;
  title: string;
  body: string;
}

const START_EVENT = "fp:tour:start";
const GAP = 14;
const PAD = 8;
// Room kept clear at the bottom for the control bar (its height, its gap to
// the edge, and a little air), so the step card never sits under it.
const BAR = 72;

const seenKey = (userId: string | undefined, tourKey: string) =>
  `fp-tour-seen:${userId ?? "anon"}:${tourKey}`;

function isSeen(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    // Blocked storage: treat as seen so it never nags on every page load.
    return true;
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Nothing to persist to; it just won't be remembered.
  }
}

function findTarget(target?: string): HTMLElement | null {
  if (!target) return null;
  // The same marker can exist twice (a phone layout and a desktop one, one of
  // them hidden), so take the first copy that is actually on screen.
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** Ask a mounted `ProductTour` with this key to start again. */
export function startTour(tourKey: string) {
  window.dispatchEvent(new CustomEvent(START_EVENT, { detail: tourKey }));
}

/** A small "Take the tour" button that replays a tour on demand. */
export function TourReplayButton({
  tourKey,
  className = "",
}: {
  tourKey: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => startTour(tourKey)}
      className={`inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">tour</span>
      Take the tour
    </button>
  );
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * A first-visit walkthrough. Shows once per person per browser, the first time
 * the page it sits on is opened, and can be replayed with `TourReplayButton`.
 * Each step dims the page and lights up one element; `Esc` or Skip ends it.
 * Skip, Back and Next sit in one bar fixed to the bottom of the screen, so
 * they stay in the same place while the step card moves to each element.
 */
export function ProductTour({
  tourKey,
  steps,
  autoStart = true,
}: {
  tourKey: string;
  steps: TourStep[];
  autoStart?: boolean;
}) {
  const userId = useAuthStore((s) => s.user?.id);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authOpen = useAuthStore((s) => s.isOpen);
  const storageKey = seenKey(userId, tourKey);

  const [active, setActive] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vw, setVw] = useState(1024);
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  });
  const nextRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const begin = useCallback(() => {
    const usable = stepsRef.current.filter(
      (s) => !s.target || findTarget(s.target),
    );
    // Nothing on screen to point at (e.g. the desktop dashboard on a phone):
    // an intro and a sign-off alone would be a tour of nothing.
    if (!usable.some((s) => s.target)) return;
    setIndex(0);
    setActive(usable);
  }, []);

  const close = useCallback(() => {
    markSeen(storageKey);
    setActive(null);
    setRect(null);
  }, [storageKey]);

  // First visit: wait for the signed-in user, then a beat for the page's own
  // data to put its sections on screen.
  useEffect(() => {
    if (!autoStart || isLoading || !userId || authOpen) return;
    if (isSeen(storageKey)) return;
    const t = window.setTimeout(begin, 900);
    return () => window.clearTimeout(t);
  }, [autoStart, isLoading, userId, authOpen, storageKey, begin]);

  useEffect(() => {
    const onStart = (e: Event) => {
      if ((e as CustomEvent).detail === tourKey) begin();
    };
    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, [tourKey, begin]);

  const step = active?.[index];

  const measure = useCallback(() => {
    setVw(window.innerWidth);
    const el = findTarget(step?.target);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    findTarget(step.target)?.scrollIntoView({ block: "center" });
    measure();
  }, [step, measure]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, active.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, index, close]);

  if (!active || !step) return null;

  const last = index === active.length - 1;
  const narrow = vw < 640;
  const cardWidth = Math.min(340, vw - 32);

  // Beside the highlighted element: below it if there is room, otherwise above.
  // Phones get a sheet pinned just above the control bar instead.
  let cardStyle: React.CSSProperties;
  if (!rect || narrow) {
    cardStyle = narrow
      ? { left: 16, right: 16, bottom: BAR + GAP }
      : {
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: cardWidth,
        };
  } else {
    const below = rect.top + rect.height + PAD + GAP;
    const roomBelow = window.innerHeight - BAR - below > 200;
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - cardWidth / 2),
      vw - cardWidth - 16,
    );
    const roomAbove = rect.top - PAD - GAP > 220;
    // A section taller than the screen leaves no room on either side, so the
    // card sits over its lower edge instead of off-screen.
    cardStyle = roomBelow
      ? { left, top: below, width: cardWidth }
      : roomAbove
        ? {
            left,
            bottom: window.innerHeight - rect.top + PAD + GAP,
            width: cardWidth,
          }
        : { left, bottom: BAR + GAP, width: cardWidth };
  }

  // In the body, not where the component sits: a page can mount it inside a
  // layout that is hidden at this screen size, which would hide the tour too.
  return createPortal(
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Click-catcher: the page underneath is not interactive mid-tour. */}
      <div className="absolute inset-0" onClick={close} />
      {rect ? (
        <div
          aria-hidden
          className="absolute rounded-2xl pointer-events-none transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow:
              "0 0 0 9999px rgba(0, 0, 0, 0.62), 0 0 0 2px var(--color-accent, #C4E85A)",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "rgba(0, 0, 0, 0.62)",
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl"
          style={cardStyle}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5">
            Step {index + 1} of {active.length}
          </p>
          <h3
            id={titleId}
            className="font-display text-lg font-bold text-white mb-1.5"
          >
            {step.title}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed">{step.body}</p>
        </motion.div>
      </AnimatePresence>

      {/* Not keyed by step, so it holds still while the card moves. Back is
          disabled rather than removed on the first step for the same reason. */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-surface/95 p-1.5 shadow-2xl backdrop-blur"
        style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={close}
          className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          {last ? "Close" : "Skip tour"}
        </button>
        <span aria-hidden className="h-6 w-px bg-white/10" />
        <button
          type="button"
          aria-label="Previous step"
          title="Previous step"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back
          </span>
        </button>
        {narrow ? (
          <span
            aria-hidden
            className="min-w-10 text-center text-xs font-bold tabular-nums text-white/70"
          >
            {index + 1}/{active.length}
          </span>
        ) : (
          <span aria-hidden className="flex items-center gap-1 px-1.5">
            {active.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === index ? "w-4 bg-accent" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </span>
        )}
        <button
          ref={nextRef}
          type="button"
          aria-label={last ? "Finish tour" : "Next step"}
          title={last ? "Finish tour" : "Next step"}
          onClick={() => (last ? close() : setIndex((i) => i + 1))}
          className="flex size-10 items-center justify-center rounded-full bg-accent text-black cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {last ? "check" : "arrow_forward"}
          </span>
        </button>
      </div>
    </div>,
    document.body,
  );
}

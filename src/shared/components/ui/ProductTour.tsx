"use client";

import {
  useCallback,
  useEffect,
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
  // Phones get a sheet pinned to the bottom edge instead.
  let cardStyle: React.CSSProperties;
  if (!rect || narrow) {
    cardStyle = narrow
      ? { left: 16, right: 16, bottom: 16 }
      : {
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: cardWidth,
        };
  } else {
    const below = rect.top + rect.height + PAD + GAP;
    const roomBelow = window.innerHeight - below > 200;
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
        : { left, bottom: 16, width: cardWidth };
  }

  // In the body, not where the component sits: a page can mount it inside a
  // layout that is hidden at this screen size, which would hide the tour too.
  return createPortal(
    <div className="fixed inset-0 z-[200]" role="presentation">
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
              "0 0 0 9999px rgba(0, 0, 0, 0.62), 0 0 0 2px var(--color-accent, #ccff00)",
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
          role="dialog"
          aria-modal="true"
          aria-label={step.title}
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
          <h3 className="font-display text-lg font-bold text-white mb-1.5">
            {step.title}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            {step.body}
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={close}
              className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              {last ? "Close" : "Skip tour"}
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i - 1)}
                  className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={() => (last ? close() : setIndex((i) => i + 1))}
                className="px-4 py-1.5 rounded-full bg-accent text-black text-xs font-bold cursor-pointer"
              >
                {last ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}

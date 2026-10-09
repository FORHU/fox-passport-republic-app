"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/** Set once the guide is finished or dismissed — this browser only. */
const WELCOME_SEEN_KEY = "fp-welcome-seen";

interface Slide {
  icon: string;
  color: string;
  title: string;
  body: string;
  /** Small labelled chips under the body (the Foxer roles). */
  chips?: { label: string; color: string }[];
}

const SLIDES: Slide[] = [
  {
    icon: "",
    color: "#ccff00",
    title: "Welcome to FoxPassport",
    body: "Plan, book and live unforgettable events — and meet the people who make them happen.",
  },
  {
    icon: "explore",
    color: "#a78bfa",
    title: "Discover experiences",
    body: "Browse trending events, venues, gear and talent near you. Filter by vibe — birthdays, weddings, corporate nights and more.",
  },
  {
    icon: "handshake",
    color: "#00d2ff",
    title: "Book Foxers in one place",
    body: "Foxers are the verified pros behind every event. See their real availability, book them directly and pay securely.",
    chips: [
      { label: "Event", color: "#ccff00" },
      { label: "Venue", color: "#a78bfa" },
      { label: "Gear", color: "#f97316" },
      { label: "Talent", color: "#00d2ff" },
      { label: "Performer", color: "#f59e0b" },
    ],
  },
  {
    icon: "workspace_premium",
    color: "#f59e0b",
    title: "Stamp your passport",
    body: "Every event you attend earns stamps, badges and levels on your digital FoxPassport.",
  },
  {
    icon: "groups",
    color: "#ec4899",
    title: "Join the Republic",
    body: "Follow friends, post to the feed, chat with hosts and match with Foxers who fit your plans.",
  },
  {
    icon: "rocket_launch",
    color: "#ccff00",
    title: "Ready when you are",
    body: "Create a free account to book and earn stamps. Want to earn instead? Apply as a Foxer once you're signed up.",
  },
];

function markSeen() {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    // Blocked storage: the guide may show again next visit, nothing worse.
  }
}

/**
 * A short introduction for first-time visitors who aren't signed in. Shows
 * once per browser over the landing page; any way out (finish, skip, Esc,
 * either auth button) marks it seen.
 */
export default function WelcomeGuide() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authModalOpen = useAuthStore((s) => s.isOpen);
  const openSignup = useAuthStore((s) => s.openSignup);
  const openLogin = useAuthStore((s) => s.openLogin);

  // Read storage after mount only, so server and first client render agree.
  const [seen, setSeen] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(WELCOME_SEEN_KEY) === "1");
    } catch {
      setSeen(true);
    }
  }, []);

  const visible = !seen && !isLoading && !isAuthenticated && !authModalOpen;
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const dismiss = useCallback(() => {
    markSeen();
    setSeen(true);
  }, []);

  const go = useCallback((to: number) => {
    setIndex((current) => {
      const next = Math.max(0, Math.min(SLIDES.length - 1, to));
      setDirection(next >= current ? 1 : -1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, index, go, dismiss]);

  const startAuth = (open: () => void) => {
    dismiss();
    open();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-guide"
          className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-guide-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={dismiss}
          />

          <motion.div
            className="relative w-full sm:max-w-md bg-surface border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            {/* Glow tinted by the current slide */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: slide.color }}
            />

            <div className="relative p-6 sm:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  {index + 1} / {SLIDES.length}
                </span>
                {!isLast && (
                  <button
                    type="button"
                    onClick={dismiss}
                    className="text-xs font-bold text-white/50 hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                )}
              </div>

              <div className="relative min-h-[300px] sm:min-h-[290px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={index}
                    custom={direction}
                    initial={{ x: direction * 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -40, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60) go(index + 1);
                      else if (info.offset.x > 60) go(index - 1);
                    }}
                    className="flex flex-col items-center text-center touch-pan-y"
                  >
                    <div
                      className="h-24 w-24 rounded-3xl flex items-center justify-center mb-6 border border-white/10"
                      style={{
                        background: `color-mix(in srgb, ${slide.color} 18%, transparent)`,
                      }}
                    >
                      {index === 0 ? (
                        <img
                          src="/foxonlylogo.png"
                          alt=""
                          className="h-14 w-14 object-contain"
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined text-[48px]"
                          style={{ color: slide.color }}
                        >
                          {slide.icon}
                        </span>
                      )}
                    </div>

                    <h2
                      id="welcome-guide-title"
                      className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white mb-3"
                    >
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-sm">
                      {slide.body}
                    </p>

                    {slide.chips && (
                      <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {slide.chips.map((chip) => (
                          <span
                            key={chip.label}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/80"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: chip.color }}
                            />
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots — also jump straight to a slide */}
              <div className="flex justify-center gap-1.5 mb-6">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}: ${s.title}`}
                    aria-current={i === index ? "step" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-6 bg-accent"
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {isLast ? (
                <div className="space-y-2.5">
                  <button
                    ref={nextRef}
                    type="button"
                    onClick={() => startAuth(openSignup)}
                    className="w-full py-3.5 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition-colors"
                  >
                    Create free account
                  </button>
                  <button
                    type="button"
                    onClick={() => startAuth(openLogin)}
                    className="w-full py-3.5 rounded-xl border border-white/15 text-white font-bold hover:bg-white/5 transition-colors"
                  >
                    I already have an account
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    Just look around
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => go(index - 1)}
                      className="px-5 py-3.5 rounded-xl border border-white/15 text-white font-bold hover:bg-white/5 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    ref={nextRef}
                    type="button"
                    onClick={() => go(index + 1)}
                    className="flex-1 py-3.5 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5"
                  >
                    {index === 0 ? "Show me around" : "Next"}
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The "0" of the 404, drawn as a passport stamp. It presses down once on load
 * (a state change: "this page was rejected"), then stays still. Sized in `em`
 * so it scales with the surrounding numerals at every breakpoint.
 */
export default function NotFoundStamp() {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className="relative mx-[0.04em] inline-flex h-[0.78em] w-[0.78em] shrink-0 items-center justify-center rounded-full border-[0.075em] align-middle"
      style={{ borderColor: "var(--accent-text)", color: "var(--accent-text)" }}
      initial={reduce ? false : { opacity: 0, scale: 1.35, rotate: -18 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 }}
    >
      <span className="pointer-events-none absolute inset-[0.07em] rounded-full border-[0.015em] border-dashed border-current opacity-60" />
      <span className="font-body text-[0.085em] font-bold uppercase leading-none tracking-[0.2em]">
        No entry
      </span>
    </motion.span>
  );
}

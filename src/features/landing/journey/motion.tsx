"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

/** Counts up once, the first time it scrolls into view. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}

/** A headline that rises line by line out of a mask. */
export function MaskLines({
  lines,
  className,
  delay = 0.1,
}: {
  lines: React.ReactNode[];
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={`block ${className ?? ""}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.11,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Fades and lifts into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Small mono label used above section headings. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-landing-mono text-xs font-bold uppercase tracking-[0.28em] text-white/70">
      {children}
    </p>
  );
}

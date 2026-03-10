/**
 * Animation utility constants and helper functions
 */

// Animation timing constants
export const ANIMATION_TIMINGS = {
  fast: "0.15s",
  normal: "0.3s",
  slow: "0.5s",
  slower: "0.8s",
  slowest: "1s",
} as const;

// Animation easing functions
export const ANIMATION_EASINGS = {
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

// Staggered animation delays for child elements
export const STAGGER_DELAYS = {
  child1: "delay-[100ms]",
  child2: "delay-[200ms]",
  child3: "delay-[300ms]",
  child4: "delay-[400ms]",
  child5: "delay-[500ms]",
  child6: "delay-[600ms]",
} as const;

/**
 * Generate staggered delay className for nth child
 * @param index - Zero-based index of child element
 * @param delayMs - Base delay in milliseconds (default: 100)
 */
export function getStaggerDelay(index: number, delayMs: number = 100): string {
  const totalDelay = (index + 1) * delayMs;
  return `delay-[${totalDelay}ms]`;
}

/**
 * Combine animation classes with optional custom duration and easing
 */
export function animationClass(
  animation: string,
  duration?: keyof typeof ANIMATION_TIMINGS,
  easing?: keyof typeof ANIMATION_EASINGS
): string {
  const classes = [animation];

  if (duration) {
    classes.push(`duration-${ANIMATION_TIMINGS[duration]}`);
  }

  if (easing) {
    classes.push(`ease-${easing}`);
  }

  return classes.join(" ");
}

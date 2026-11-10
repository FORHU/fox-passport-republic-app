import { cn } from "@/shared/lib/utils";

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

const TONES = {
  /** Accent arc on a light track, for dark surfaces. */
  accent: "border-white/20 border-t-accent",
  /** Black arc, for inside an accent (lime) button. */
  onAccent: "border-black/20 border-t-black",
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  /**
   * Read by screen readers. Leave it out when visible text next to the
   * spinner already says what is happening ("Saving…"); the spinner is then
   * hidden from assistive tech.
   */
  label?: string;
  className?: string;
}

/**
 * The small ring spinner for actions in progress: a button that is saving, a
 * "load more", a payment being set up. For content that is loading, draw its
 * shape with `Skeleton`; for a whole page, use `PageLoader`.
 */
export function Spinner({
  size = "md",
  tone = "accent",
  label,
  className,
}: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-2 motion-reduce:animate-[spin_1.5s_linear_infinite]",
        SIZES[size],
        TONES[tone],
        className,
      )}
    />
  );
}

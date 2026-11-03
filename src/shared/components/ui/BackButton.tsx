"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { smartBack } from "@/shared/lib/navigation";

/**
 * The one back control for the app. Back buttons used to come in nine
 * different looks (32/36/40px circles, zinc chips, lucide vs Material arrows,
 * eight text tones); every page now renders this instead.
 *
 * Navigation, in priority order:
 * - `onClick` - overrides everything (builder `onBack`, wizard steps).
 * - `href` - always goes there, rendered as a Link.
 * - `fallback` - `smartBack`: previous page if it was on this site, else here.
 */
interface BackButtonProps {
  fallback?: string;
  href?: string;
  onClick?: () => void;
  /** `icon` is a 40px circle for headers; `label` is arrow + text. */
  variant?: "icon" | "label";
  /** `overlay` sits on top of photos (dark, blurred). */
  tone?: "default" | "overlay";
  label?: string;
  /** Label variant only: show just the arrow below `sm`. */
  hideLabelOnMobile?: boolean;
  className?: string;
}

const BASE =
  "inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

const STYLES = {
  icon: {
    default:
      "h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    overlay:
      "h-10 w-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-black/60",
  },
  label: {
    default:
      "gap-2 rounded-full text-sm font-semibold text-white/60 hover:text-white",
    overlay:
      "gap-2 h-10 px-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-sm font-semibold text-white hover:bg-black/60",
  },
} as const;

export function BackButton({
  fallback = "/",
  href,
  onClick,
  variant = "icon",
  tone = "default",
  label = "Back",
  hideLabelOnMobile = false,
  className,
}: BackButtonProps) {
  const classes = cn(BASE, STYLES[variant][tone], className);
  // Icon-only (or label hidden on phones) still needs a name for screen readers.
  const ariaLabel =
    variant === "icon" || hideLabelOnMobile
      ? label === "Back"
        ? "Go back"
        : label
      : undefined;

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "material-symbols-outlined",
          variant === "icon" ? "text-[20px]" : "text-[18px]",
        )}
      >
        arrow_back
      </span>
      {variant === "label" && (
        <span className={hideLabelOnMobile ? "hidden sm:inline" : undefined}>
          {label}
        </span>
      )}
    </>
  );

  if (href && !onClick) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return (
    <FallbackBackButton
      fallback={fallback}
      ariaLabel={ariaLabel}
      className={classes}
    >
      {content}
    </FallbackBackButton>
  );
}

// Only this path needs the router, so `href`/`onClick` buttons stay usable
// where no app router is mounted.
function FallbackBackButton({
  fallback,
  ariaLabel,
  className,
  children,
}: {
  fallback: string;
  ariaLabel?: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => smartBack(router, fallback)}
      className={className}
    >
      {children}
    </button>
  );
}

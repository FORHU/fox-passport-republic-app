import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] shadow-sm transition-colors",
  {
    variants: {
      variant: {
        // Partner/commercial accreditation — "Partner Foxer" and similar.
        partner:
          "bg-amber-400/15 border-amber-400/40 text-amber-300 font-black uppercase tracking-wider",
        // Verified/accent status — "Verified Citizen" and similar.
        verified:
          "bg-lime-400/10 border-lime-400/20 text-lime-400 font-bold uppercase tracking-wider",
        // Transactional confirmation (e.g. "Verified Booking") — kept
        // distinct from `verified`'s lime brand accent.
        success:
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider",
        // Plain role/category tag — no special standing implied, so it
        // stays text-only rather than reading as an earned status.
        neutral:
          "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 font-semibold capitalize shadow-none",
        destructive:
          "bg-red-500/10 border-red-500/30 text-red-400 font-bold uppercase tracking-wider",
        // Filled, high-emphasis versions for when the badge needs to pop
        // (e.g. against a busy image) instead of sitting flush with the card.
        solid:
          "bg-lime-400 border-transparent text-black font-black uppercase tracking-wider shadow-md",
        "solid-amber":
          "bg-amber-400 border-transparent text-black font-black uppercase tracking-wider shadow-md",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

// Every status variant carries its own icon by default so it reads as an
// earned badge, not a plain colored label — `neutral` role tags are the
// deliberate exception, since those don't represent a status.
const DEFAULT_ICONS: Partial<Record<BadgeVariant, LucideIcon>> = {
  partner: BadgeCheck,
  verified: ShieldCheck,
  success: CheckCircle2,
  destructive: AlertTriangle,
  solid: BadgeCheck,
  "solid-amber": BadgeCheck,
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Small pulsing status dot before the label (e.g. "live" indicators). */
  dot?: boolean;
  /** Shows the variant's default icon. Defaults to on for every status
   * variant, off for `neutral`. Pass `false` to suppress it. */
  icon?: boolean;
}

// Single source of truth for the small pill badges used all over the app
// (Partner Foxer, Verified Citizen, role tags, PRO/LIVE markers, etc.) —
// these had drifted into several one-off styles across components.
function Badge({
  className,
  variant = "neutral",
  dot,
  icon,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant = variant ?? "neutral";
  const showIcon = icon ?? resolvedVariant !== "neutral";
  const Icon = DEFAULT_ICONS[resolvedVariant];

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

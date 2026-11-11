"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import {
  StyledSelect,
  type StyledSelectOption,
} from "@/shared/components/ui/StyledSelect";

type Tone = "accent" | "amber";

interface DashboardListToolbarProps {
  search: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  status: {
    value: string;
    onChange: (value: string) => void;
    options: StyledSelectOption[];
  };
  /** The page's primary "add" action. Pass `href` for a link, `onClick` for a button. */
  action?: {
    label: string;
    icon?: string;
    href?: string;
    onClick?: () => void;
  };
  tone?: Tone;
}

const TONE = {
  accent: {
    focus: "focus:border-accent/60 focus:ring-accent/20",
    button: "bg-accent hover:bg-accent-hover focus-visible:ring-accent/40",
  },
  amber: {
    focus: "focus:border-amber-400/60 focus:ring-amber-400/20",
    button: "bg-amber-400 hover:bg-amber-300 focus-visible:ring-amber-400/40",
  },
} as const;

// One row under a creator-dashboard page title: search fills the row, then
// the status filter, then the add action. All three share one height and
// shape so the row reads as a single toolbar.
export function DashboardListToolbar({
  search,
  status,
  action,
  tone = "accent",
}: DashboardListToolbarProps) {
  const t = TONE[tone];

  const actionClass = cn(
    "h-11 px-5 w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-black transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    t.button,
  );
  const actionContent = action && (
    <>
      <span className="material-symbols-outlined text-[20px]">
        {action.icon ?? "add"}
      </span>
      {action.label}
    </>
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-0">
        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-[20px]">
          search
        </span>
        <input
          aria-label={search.placeholder.replace(/\.+$/, "")}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          placeholder={search.placeholder}
          className={cn(
            "h-11 w-full rounded-full bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/40 transition-colors",
            "hover:border-white/20 focus:outline-none focus:ring-2",
            t.focus,
          )}
        />
      </div>

      <div className="w-full sm:w-48 shrink-0">
        <StyledSelect
          value={status.value}
          onChange={status.onChange}
          options={status.options}
          className="h-11 py-0 rounded-full hover:border-white/20"
        />
      </div>

      {action &&
        (action.href ? (
          <Link href={action.href} className={actionClass}>
            {actionContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className={actionClass}
          >
            {actionContent}
          </button>
        ))}
    </div>
  );
}

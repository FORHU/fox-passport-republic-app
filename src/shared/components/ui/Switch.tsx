"use client";

import type { ReactNode } from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Drawn inside the knob, e.g. an icon for the current state. */
  thumb?: ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * An on/off switch: accent track with the knob right when on, muted track
 * with the knob left when off. The look of the profile settings and team
 * panel switches.
 * A native button, so Space and Enter flip it.
 */
export function Switch({
  checked,
  onCheckedChange,
  thumb,
  id,
  disabled,
  className = "",
  title,
  ...aria
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      title={title}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-text) disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-accent" : "bg-white/15"
      } ${className}`}
      {...aria}
    >
      {/* Off: a light knob, as in the team panel's switch, so it doesn't
          vanish into a dark header the way a black one on white/10 does. */}
      <span
        aria-hidden
        className={`absolute top-0.5 left-0.5 flex h-5 w-5 items-center justify-center rounded-full transition-transform ${
          checked
            ? "translate-x-5 bg-black text-accent"
            : "translate-x-0 bg-white/70 text-black"
        }`}
      >
        {thumb}
      </span>
    </button>
  );
}

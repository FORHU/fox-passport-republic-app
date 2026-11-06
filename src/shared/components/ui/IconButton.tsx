"use client";

import * as React from "react";

/**
 * A button that shows only an icon. `label` is required: it is the button's
 * accessible name, so describe the action ("Close", "Show password"), not the
 * icon. The icon itself is hidden from screen readers, which matters for
 * Material Symbols, whose ligature text ("visibility") would otherwise be read.
 */
export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "aria-pressed" | "children"
> {
  label: string;
  icon: React.ReactNode;
  /** For toggles: sets `aria-pressed`. */
  pressed?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, icon, pressed, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        {...props}
      >
        <span aria-hidden="true" className="contents">
          {icon}
        </span>
      </button>
    );
  },
);

export default IconButton;

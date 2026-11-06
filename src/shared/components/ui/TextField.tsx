"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { FieldControl, FieldError } from "./FieldError";

/**
 * A labelled text input. The label is required and linked to the input by a
 * generated id, so it can render any number of times on a page (a popup that
 * opens twice, a form in two layouts) without colliding.
 *
 * `required` sets `aria-required` only, not the native attribute, so schema
 * validation (zod) keeps its own messages instead of the browser's bubbles.
 * The hint and the error are announced with the field (`aria-describedby`);
 * the error also announces itself when it appears (`role="alert"`).
 */
export interface TextFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "required"
> {
  label: string;
  /** Keeps the label for screen readers but hides it on screen. */
  labelHidden?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  /** A decorative icon inside the input's box at the left edge. Hidden from screen readers. */
  leading?: React.ReactNode;
  /** Rendered inside the input's box at the right edge, e.g. a show-password toggle. */
  trailing?: React.ReactNode;
  labelClassName?: string;
  inputClassName?: string;
}

const DEFAULT_LABEL =
  "block text-xs font-bold text-white/90 tracking-wide mb-1.5 ml-1 group-focus-within:text-accent transition-colors";
const DEFAULT_INPUT =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50 focus:bg-white/10 transition-all font-medium";

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      labelHidden,
      hint,
      error,
      required,
      leading,
      trailing,
      className,
      labelClassName,
      inputClassName,
      id: idProp,
      "aria-describedby": describedByProp,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy =
      [describedByProp, hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("group", className)}>
        <label
          htmlFor={id}
          className={
            labelHidden ? "sr-only" : (labelClassName ?? DEFAULT_LABEL)
          }
        >
          {label}
        </label>
        <FieldControl invalid={!!error && !trailing}>
          {leading && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/50 group-focus-within:text-accent transition-colors"
            >
              {leading}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              inputClassName ?? DEFAULT_INPUT,
              leading && "pl-11",
              trailing && "pr-12",
              error && "field-invalid",
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {trailing}
            </div>
          )}
        </FieldControl>
        {hint && (
          <div id={hintId} className="mt-1.5 ml-1 text-xs text-white/50">
            {hint}
          </div>
        )}
        <FieldError
          id={errorId ?? ""}
          message={error}
          className="mt-1.5 ml-1"
        />
      </div>
    );
  },
);

export default TextField;

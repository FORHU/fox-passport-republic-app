import { CircleAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/*
 * Field errors, three pieces that go together:
 *
 *   <FieldControl invalid={!!error}>
 *     <input
 *       className={cn("…", error && "field-invalid")}
 *       aria-invalid={!!error}
 *       aria-describedby={error ? "phone-error" : undefined}
 *     />
 *   </FieldControl>
 *   <FieldError id="phone-error" message={error} />
 *
 * `field-invalid` (globals.css) gives the input the red border and tint,
 * FieldControl puts the error icon inside it, and FieldError is the message
 * below.
 */

/** Wraps an input so an invalid one shows the error icon at its right edge. */
export function FieldControl({
  invalid,
  children,
  className,
}: {
  invalid?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {/* Lucide, not Material Symbols: the app renders those filled, and
          this icon is an outlined circle. */}
      {invalid && (
        <CircleAlert
          aria-hidden
          strokeWidth={2}
          className="pointer-events-none absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-red-400"
        />
      )}
    </div>
  );
}

/**
 * The message under a form field that failed validation. Renders nothing when
 * there is no message. Point the input at it with `aria-describedby={id}` and
 * set `aria-invalid` so screen readers announce it with the field.
 */
export function FieldError({
  id,
  message,
  className,
}: {
  id: string;
  message?: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex items-start gap-1.5 text-xs leading-4 text-red-400",
        className,
      )}
    >
      <CircleAlert
        aria-hidden
        strokeWidth={2}
        className="mt-px size-3.5 shrink-0"
      />
      <span>{message}</span>
    </p>
  );
}

export default FieldError;

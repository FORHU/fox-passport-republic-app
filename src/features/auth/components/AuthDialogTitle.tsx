"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * The heading of an auth form. It is the auth popup's title, so the dialog is
 * announced by it ("Join the Hype, dialog"). The forms render only inside
 * `AuthModal`, which provides the dialog context this needs.
 */
export function AuthDialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Title asChild>
      <h2 className={className}>{children}</h2>
    </DialogPrimitive.Title>
  );
}

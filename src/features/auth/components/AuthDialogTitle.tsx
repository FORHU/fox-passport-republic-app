"use client";

import { createContext, useContext } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * True inside `AuthModal`. The auth forms render there and on the /auth page,
 * where there is no dialog context for Radix's title to read.
 */
export const AuthInDialogContext = createContext(false);

/**
 * The heading of an auth form. In the auth popup it is the dialog's title, so
 * the dialog is announced by it ("Join the Hype, dialog"). On the /auth page it
 * is the page's own h1.
 */
export function AuthDialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const inDialog = useContext(AuthInDialogContext);
  if (!inDialog) return <h1 className={className}>{children}</h1>;
  return (
    <DialogPrimitive.Title asChild>
      <h2 className={className}>{children}</h2>
    </DialogPrimitive.Title>
  );
}

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

/** The pop-up the booked-event repairs open in, styled like `ConfirmDialog`. */
export function BookedDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** While true, the dialog can't be dismissed. */
  busy?: boolean;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-[0_10px_35px_rgba(0,0,0,0.25)] focus:outline-none"
        >
          <DialogPrimitive.Title className="font-display text-lg font-bold text-white">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-1.5 text-sm text-white/50">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{children}</div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const secondaryButton =
  "rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50";
export const primaryButton =
  "flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed";

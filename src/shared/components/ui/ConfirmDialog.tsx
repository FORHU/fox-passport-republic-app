"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/shared/lib/utils";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for destructive actions: red confirm button and warning icon. */
  tone?: "default" | "danger";
}

/** A second way to confirm, shown between Cancel and the main button. */
export interface ConfirmSecondaryAction {
  label: string;
  /** Same contract as `onConfirm`: pending disables, a rejection keeps it open. */
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Runs on confirm. While a returned promise is pending both buttons are
   * disabled and the dialog can't be dismissed; it closes when the promise
   * resolves and stays open if it rejects (the caller shows the error).
   */
  onConfirm: () => void | Promise<void>;
  /** Optional alternative answer, e.g. "I'm busy then" next to "Decline". */
  secondaryAction?: ConfirmSecondaryAction;
}

/** The "Are you sure?" pop-up. For a one-line `await confirm(...)`, see `useConfirm`. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  secondaryAction,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const danger = tone === "danger";

  const run = async (action: () => void | Promise<void>) => {
    setPending(true);
    try {
      await action();
      onOpenChange(false);
    } catch {
      // Stay open so they can retry or cancel; onConfirm reports the error.
    } finally {
      setPending(false);
    }
  };
  const handleConfirm = () => run(onConfirm);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          // Land on Cancel, not the action, so Enter can't confirm by accident.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelRef.current?.focus();
          }}
          // Radix warns when there is no Description unless this is unset.
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface-raised p-6 shadow-[0_10px_35px_rgba(0,0,0,0.25)] focus:outline-none",
            // Three answers need the room to stay on one line each.
            secondaryAction ? "max-w-md" : "max-w-sm",
          )}
        >
          <div
            className={cn(
              "mb-4 flex h-11 w-11 items-center justify-center rounded-full",
              danger ? "bg-red-500/10 text-red-400" : "bg-accent/10 text-accent",
            )}
          >
            <span aria-hidden className="material-symbols-outlined text-[22px]">
              {danger ? "warning" : "help"}
            </span>
          </div>
          <DialogPrimitive.Title className="font-display text-lg font-bold text-white">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-1.5 text-sm text-white/50">
              {description}
            </DialogPrimitive.Description>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close asChild>
              <button
                ref={cancelRef}
                type="button"
                disabled={pending}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>
            {secondaryAction && (
              <button
                type="button"
                onClick={() => run(secondaryAction.onConfirm)}
                disabled={pending}
                className={cn(
                  "rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50",
                  danger
                    ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                    : "border-accent/40 text-accent hover:bg-accent/10",
                )}
              >
                {secondaryAction.label}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-50",
                danger
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-accent text-black",
              )}
            >
              {pending && (
                <span
                  aria-hidden
                  className="material-symbols-outlined text-[18px] animate-spin"
                >
                  progress_activity
                </span>
              )}
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * `window.confirm`, on-brand: `if (!(await confirm({ title }))) return;`.
 * Render the returned `dialog` once in the component; no provider needed.
 */
export function useConfirm() {
  const [request, setRequest] = React.useState<
    (ConfirmOptions & { resolve: (ok: boolean) => void }) | null
  >(null);
  const [open, setOpen] = React.useState(false);

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest({ ...options, resolve });
        setOpen(true);
      }),
    [],
  );

  // `request` is kept after closing so the exit animation has content; a
  // promise only settles once, so the false from closing after a confirm is
  // ignored.
  const dialog = request ? (
    <ConfirmDialog
      {...request}
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        setOpen(false);
        request.resolve(false);
      }}
      onConfirm={() => request.resolve(true)}
    />
  ) : null;

  return { confirm, dialog };
}

export default ConfirmDialog;

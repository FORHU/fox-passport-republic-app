"use client";

import React, { useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { IconButton } from "@/shared/components/ui/IconButton";
import AuthFormView from "@/features/auth/components/AuthFormView";
import { AuthInDialogContext } from "@/features/auth/components/AuthDialogTitle";
import { Money } from "@/shared/components/ui/Money";
import type { BookingSummary } from "@/shared/auth/useAuthStore";

/** The package being reserved, beside the form, so signing up feels like booking. */
function BookingAside({ summary }: { summary: BookingSummary }) {
  const details = [summary.place, summary.date].filter(Boolean).join(" · ");
  return (
    <aside className="border-b border-white/10 lg:border-b-0 lg:border-r">
      {summary.image && (
        <img
          src={summary.image}
          alt=""
          className="hidden h-56 w-full object-cover lg:block"
        />
      )}
      <div className="flex items-center gap-4 p-5 lg:block lg:p-7">
        {summary.image && (
          <img
            src={summary.image}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover lg:hidden"
          />
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">
            Your package
          </p>
          <h3 className="mt-1 truncate text-lg font-bold text-white lg:whitespace-normal lg:text-xl">
            {summary.title}
          </h3>
          {details && <p className="mt-1 text-sm text-white/70">{details}</p>}
          {summary.price ? (
            <p className="mt-3 hidden text-sm text-white/65 lg:block">
              From{" "}
              <span className="text-lg font-bold text-white">
                <Money amount={summary.price} />
              </span>
            </p>
          ) : null}
          <p className="mt-3 hidden text-sm text-white/70 lg:block">
            You won&apos;t be charged yet
          </p>
        </div>
      </div>
    </aside>
  );
}

/** The first field of the current view, else its first button. */
function firstControl(root: HTMLElement | null) {
  return root?.querySelector<HTMLElement>(
    "input:not([type=hidden]):not([disabled]), button:not([disabled])",
  );
}

export default function AuthModal() {
  const { isOpen, view, close, bookingSummary } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  // The popup is opened from ~20 places (header, booking, follow…), none of
  // them a Radix Trigger, so Radix can't return focus by itself. Remember
  // whatever had focus when it opened and give focus back on close.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Switching view (log in ↔ sign up ↔ forgot) unmounts the focused button,
  // which would drop focus to <body>. Move it to the new view's first field.
  const previousView = useRef(view);
  useEffect(() => {
    if (!isOpen) return;
    if (previousView.current !== view) {
      firstControl(formRef.current)?.focus();
    }
    previousView.current = view;
  }, [isOpen, view]);

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogPrimitive.Portal>
        {/* Safe centring: a card taller than the screen (sign-up on a short
            laptop) aligns to the top and scrolls, instead of overflowing out
            of reach above. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-100 flex items-center-safe justify-center px-4 py-6 overflow-y-auto bg-black/80 backdrop-blur-md">
          <DialogPrimitive.Content
            ref={contentRef}
            // Radix hides the rest of the page from screen readers; this says
            // so explicitly as well.
            aria-modal="true"
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              // Radix hasn't moved focus yet, so this is still the opener.
              returnFocusRef.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              event.preventDefault();
              (firstControl(formRef.current) ?? contentRef.current)?.focus();
            }}
            onCloseAutoFocus={(event) => {
              const opener = returnFocusRef.current;
              returnFocusRef.current = null;
              if (opener?.isConnected) {
                event.preventDefault();
                opener.focus();
              }
            }}
            onInteractOutside={(event) => {
              // A click on a toast ("Invalid email…") must not close the form.
              const target = event.target as Element | null;
              if (target?.closest?.("[data-sonner-toaster]")) {
                event.preventDefault();
              }
            }}
            className={`relative w-full transform transition-all focus:outline-none ${
              bookingSummary ? "max-w-4xl" : "max-w-xl"
            }`}
          >
            {/* Background Blobs */}
            <div
              aria-hidden="true"
              className="absolute -top-20 -left-20 w-56 h-56 bg-accent rounded-full blur-[100px] opacity-20 animate-pulse-slow pointer-events-none"
            ></div>
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -right-20 w-56 h-56 bg-accent rounded-full blur-[100px] opacity-10 animate-pulse-slow pointer-events-none"
              style={{ animationDelay: "1.5s" }}
            ></div>

            <div className="glass-card relative rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>

              <div
                className={
                  bookingSummary
                    ? "relative lg:grid lg:grid-cols-[320px_1fr]"
                    : ""
                }
              >
                {bookingSummary && <BookingAside summary={bookingSummary} />}
                <div className="relative p-5 sm:p-8">
                  <DialogPrimitive.Close asChild>
                    <IconButton
                      label="Close"
                      className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all hover:rotate-90 z-20"
                      icon={
                        <span className="material-symbols-outlined text-[18px]">
                          close
                        </span>
                      }
                    />
                  </DialogPrimitive.Close>

                  <div ref={formRef}>
                    <AuthInDialogContext.Provider value={true}>
                      <AuthFormView />
                    </AuthInDialogContext.Provider>
                  </div>
                </div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

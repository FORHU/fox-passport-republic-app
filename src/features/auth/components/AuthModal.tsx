"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import LoginForm from "@/features/auth/components/LoginForm";
import SignupForm from "@/features/auth/components/SignupForm";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import VerifyEmailForm from "@/features/auth/components/VerifyEmailForm";
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

export default function AuthModal() {
  const { isOpen, view, close, bookingSummary } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center px-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={close}
      ></div>

      <div
        className={`relative w-full transform transition-all ${
          bookingSummary ? "my-8 max-w-4xl" : "max-w-xl"
        }`}
      >
        {/* Background Blobs */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-accent rounded-full blur-[100px] opacity-20 animate-pulse-slow pointer-events-none"></div>
        <div
          className="absolute -bottom-20 -right-20 w-56 h-56 bg-accent rounded-full blur-[100px] opacity-10 animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        ></div>

        <div className="glass-card relative rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div
            className={
              bookingSummary ? "relative lg:grid lg:grid-cols-[320px_1fr]" : ""
            }
          >
            {bookingSummary && <BookingAside summary={bookingSummary} />}
            <div className="relative p-5 sm:p-8">
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all hover:rotate-90 z-20"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>

              {view === "login" && <LoginForm />}
              {view === "signup" && <SignupForm />}
              {view === "forgot-password" && <ForgotPasswordForm />}
              {view === "reset-password" && <ResetPasswordForm />}
              {view === "verify-email" && <VerifyEmailForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

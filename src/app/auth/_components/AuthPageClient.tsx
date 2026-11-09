"use client";

import { useEffect, useRef, useState } from "react";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import MobileAuthPage, {
  type MobileAuthView,
} from "@/features/auth/components/MobileAuthPage";
import AuthFormView from "@/features/auth/components/AuthFormView";
import { useAuthStore } from "@/shared/auth/useAuthStore";

type StoreView = ReturnType<typeof useAuthStore.getState>["view"];

/**
 * The phone layout's screen for a store view. Its reset step reads the email
 * from the store's `pendingEmail`, and sends the visitor back to "forgot" if
 * there is none when they submit.
 */
const MOBILE_VIEW: Record<StoreView, MobileAuthView> = {
  login: "login",
  signup: "signup",
  "forgot-password": "forgot",
  "reset-password": "reset",
  "verify-email": "verify",
};

/** The first field of the form on screen (phone or desktop layout). */
function firstVisibleField(root: HTMLElement | null) {
  const fields = root?.querySelectorAll<HTMLInputElement>(
    "input:not([type=hidden]):not([type=checkbox]):not([disabled])",
  );
  return Array.from(fields ?? []).find((el) => el.offsetParent !== null);
}

/**
 * The sign-in page (the footer's "Sign in"): the site header, then the form
 * already open, so nobody needs a second click to reach it.
 */
export default function AuthPageClient() {
  const isOpen = useAuthStore((state) => state.isOpen);
  const view = useAuthStore((state) => state.view);
  const close = useAuthStore((state) => state.close);
  const rootRef = useRef<HTMLDivElement>(null);
  // The phone layout keeps its own screen; a new key restarts it on another.
  const [mobile, setMobile] = useState<{ view: MobileAuthView; key: number }>({
    view: "login",
    key: 0,
  });

  // The form is on the page already, so a popup opened here (the header's
  // Sign in / Sign up, or a pending email verification on load) would be a
  // second copy. Show its view in the page's form instead.
  useEffect(() => {
    if (!isOpen) return;
    close();
    setMobile((m) => ({ view: MOBILE_VIEW[view], key: m.key + 1 }));
    requestAnimationFrame(() => firstVisibleField(rootRef.current)?.focus());
  }, [isOpen, view, close]);

  return (
    <div ref={rootRef} className="min-h-screen bg-canvas">
      <LandingHeader />

      <div className="lg:hidden">
        <MobileAuthPage key={mobile.key} initialView={mobile.view} />
      </div>

      <div className="hidden lg:flex justify-center px-4 pt-36 pb-20">
        <div className="relative w-full max-w-xl">
          <div
            aria-hidden="true"
            className="absolute -top-20 -left-20 w-56 h-56 bg-accent rounded-full blur-[100px] opacity-20 pointer-events-none"
          ></div>
          <div className="glass-card relative rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl p-8">
            <AuthFormView />
          </div>
        </div>
      </div>
    </div>
  );
}

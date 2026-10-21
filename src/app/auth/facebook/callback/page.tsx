"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/shared/components/ui/PageLoader";
import { toast } from "sonner";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { refreshSession } from "@/shared/auth/session-api";
import { takeReturnTo } from "@/shared/auth/returnTo";

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    // Better Auth has already set the session cookie by the time it sends the
    // browser here; `new=1` only steers a first sign-in to onboarding.
    // The code (Better Auth's `?error=`, or `no_session` when the session
    // didn't stick) is shown so a failure can be reported, not just retried.
    const fail = (code: string) => {
      console.error("[facebook-callback] sign-in failed:", code);
      toast.error(
        code === "email_not_found"
          ? "Facebook didn't share an email address. Add a confirmed email to your Facebook account, or sign up with email instead."
          : `Facebook sign-in failed (${code}). Please try again.`,
      );
      router.replace("/");
    };
    const error = searchParams.get("error");
    if (error) return fail(error);

    const isNewUser = searchParams.get("new") === "1";
    refreshSession().then((user) => {
      if (!user) return fail("no_session");

      login({ user });
      toast.success(`Welcome${isNewUser ? "" : " back"}!`);

      if (isNewUser) {
        localStorage.setItem("fp_new_user", "1");
        window.location.href = "/onboarding";
      } else {
        window.location.href = takeReturnTo();
      }
    });
  }, [searchParams, router, login]);

  return (
    <PageLoader label="Signing you in" />
  );
}

export default function FacebookAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <PageLoader label="Signing you in" />
      }
    >
      <FacebookCallbackContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/shared/components/ui/PageLoader";
import { toast } from "sonner";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { completeGoogleAuth } from "@/shared/auth/session-api";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    // An opaque, single-use reference — never a token. `isNewUser` comes back
    // with the redeemed session rather than from the URL, so nothing here is
    // caller-controlled.
    const exchangeCode = searchParams.get("xc");

    if (!exchangeCode) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/");
      return;
    }

    completeGoogleAuth(exchangeCode).then((session) => {
      if (!session) {
        toast.error("Google sign-in failed. Please try again.");
        router.replace("/");
        return;
      }

      const { user, isNewUser } = session;

      login({ user });
      toast.success(`Welcome${isNewUser ? "" : " back"}!`);

      if (isNewUser) {
        localStorage.setItem("fp_new_user", "1");
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    });
  }, [searchParams, router, login]);

  return (
    <PageLoader label="Signing you in" />
  );
}

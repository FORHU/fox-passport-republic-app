"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/shared/components/ui/PageLoader";
import { toast } from "sonner";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { refreshSession } from "@/shared/auth/session-api";
import { takeReturnTo } from "@/shared/auth/returnTo";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    // Better Auth has already set the session cookie by the time it sends the
    // browser here; `new=1` only steers a first sign-in to onboarding.
    const fail = () => {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/");
    };
    if (searchParams.get("error")) return fail();

    const isNewUser = searchParams.get("new") === "1";
    refreshSession().then((user) => {
      if (!user) return fail();

      login({ user });
      toast.success(`Welcome${isNewUser ? "" : " back"}!`);

      if (isNewUser) {
        localStorage.setItem("fp_new_user", "1");
        router.replace("/onboarding");
      } else {
        router.replace(takeReturnTo());
      }
    });
  }, [searchParams, router, login]);

  return <PageLoader label="Signing you in" />;
}

"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { completeFacebookAuth } from "@/shared/auth/session-api";

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const exchangeCode = searchParams.get("xc");

    if (!exchangeCode) {
      toast.error("Facebook sign-in failed. Please try again.");
      router.replace("/");
      return;
    }

    completeFacebookAuth(exchangeCode).then((session) => {
      if (!session) {
        toast.error("Facebook sign-in failed. Please try again.");
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
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Loader2 className="h-8 w-8 animate-spin text-white/60" />
    </div>
  );
}

export default function FacebookAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      }
    >
      <FacebookCallbackContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { completeGoogleAuth } from "@/shared/lib/server/auth-actions";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (!accessToken || !refreshToken) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace("/");
      return;
    }

    completeGoogleAuth(accessToken, refreshToken).then((user) => {
      if (!user) {
        toast.error("Google sign-in failed. Please try again.");
        router.replace("/");
        return;
      }

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
    <div className="flex min-h-screen items-center justify-center bg-[#050608]">
      <Loader2 className="h-8 w-8 animate-spin text-white/60" />
    </div>
  );
}

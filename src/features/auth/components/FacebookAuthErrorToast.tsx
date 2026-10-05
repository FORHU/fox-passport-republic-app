"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Surfaces a failed Facebook sign-in.
 *
 * Every failure path in the API's `facebookCallback` - a cancelled consent
 * screen, a rejected `state`, or a thrown exception - redirects here as
 * `/?facebookAuthError=1`. This toast notifies the user instead of leaving
 * them on the landing page silently unauthenticated.
 */
export default function FacebookAuthErrorToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (searchParams.get("facebookAuthError") !== "1") return;
    shown.current = true;

    toast.error("Facebook sign-in failed. Please try again.");

    const next = new URLSearchParams(searchParams.toString());
    next.delete("facebookAuthError");
    const query = next.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }, [searchParams, router]);

  return null;
}

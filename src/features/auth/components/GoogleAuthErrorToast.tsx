"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Surfaces a failed Google sign-in.
 *
 * Every failure path in the API's `googleCallback` - a cancelled consent
 * screen, a rejected `state`, a Google account whose email is unverified, a
 * thrown exception - redirects here as `/?googleAuthError=1`. Nothing read that
 * param, so a failed sign-in dropped the user back on the landing page looking
 * exactly like a successful one that had forgotten them.
 *
 * The param is stripped once shown, so a refresh or a shared link does not
 * re-raise an error that has already been seen.
 */
export default function GoogleAuthErrorToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    if (searchParams.get("googleAuthError") !== "1") return;
    shown.current = true;

    toast.error("Google sign-in failed. Please try again.");

    const next = new URLSearchParams(searchParams.toString());
    next.delete("googleAuthError");
    const query = next.toString();
    router.replace(query ? `/?${query}` : "/", { scroll: false });
  }, [searchParams, router]);

  return null;
}

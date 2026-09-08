"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { toastRequireLogin } from "@/shared/lib/toast";

// Surfaces a message when the app hard-redirects here with `?auth=expired`
// (session-manager idle logout, axios's silent-refresh failure) or
// `?auth=required` (middleware.ts bouncing a signed-out visitor off a
// protected route). Without this, either redirect lands the user back on the
// homepage with no explanation for why they were bounced.
const MESSAGES: Record<string, string> = {
  expired: "Your session has expired. Please sign in again.",
  required: "Please sign in to continue.",
};

export default function SessionExpiredToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openLogin = useAuthStore((s) => s.openLogin);

  useEffect(() => {
    const reason = searchParams?.get("auth");
    const message = reason ? MESSAGES[reason] : undefined;
    if (!message) return;

    // Purely presentational, deliberately. Clearing cookies here was tried and
    // is wrong twice over: every producer of `?auth=expired` now ends the
    // session through `endSession` *before* redirecting, so there is nothing
    // left to clear; and since anyone can link to `/?auth=expired`, a clear on
    // this path would let an outside page sign a user out of a live session.
    toastRequireLogin(message);
    openLogin();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Only ever react to the param on first paint after the redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

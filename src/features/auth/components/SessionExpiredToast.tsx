"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { toastRequireLogin } from "@/shared/lib/toast";
import { clearAuthCookies } from "@/shared/lib/server/auth-actions";

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

    // "expired" means a session that was live just died (401 interceptor,
    // idle timeout) — the httpOnly cookies from it are still sitting in the
    // browser, since neither of those paths can clear them client-side.
    // "required" is a visitor middleware.ts never saw a cookie for at all,
    // so there is nothing to clear.
    if (reason === "expired") {
      clearAuthCookies().catch(() => {});
    }

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

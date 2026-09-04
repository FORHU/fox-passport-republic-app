"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { toastRequireLogin } from "@/shared/lib/toast";

// Surfaces a message when the app hard-redirects here with `?auth=expired`
// (session-manager idle logout, axios's silent-refresh failure). Without
// this, that redirect lands the user back on the homepage with no
// explanation for why they were bounced.
export default function SessionExpiredToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openLogin = useAuthStore((s) => s.openLogin);

  useEffect(() => {
    if (searchParams?.get("auth") !== "expired") return;

    toastRequireLogin("Your session has expired. Please sign in again.");
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

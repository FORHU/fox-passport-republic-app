"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { ACCOUNT_SETUP_PATH } from "@/features/auth/api/accountSetup";

/**
 * Keeps a Google account that still lacks a username or a password on
 * /account-setup (api#419): from any other page it is sent there. The sign-in
 * callbacks under /auth/ are left to finish, since they route on their own.
 */
export default function CredentialSetupGate() {
  const pathname = usePathname();
  const router = useRouter();
  const mustSetUp = useAuthStore(
    (s) => s.isAuthenticated && !!s.user?.needsCredentialSetup,
  );

  useEffect(() => {
    if (!mustSetUp || !pathname) return;
    if (pathname === ACCOUNT_SETUP_PATH || pathname.startsWith("/auth/")) {
      return;
    }
    router.replace(ACCOUNT_SETUP_PATH);
  }, [mustSetUp, pathname, router]);

  return null;
}

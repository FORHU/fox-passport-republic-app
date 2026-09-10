"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { clearAuthCookies } from "@/shared/lib/server/auth-actions";

export const useLogout = () => {
  const router = useRouter();
  const { logout, openLogin } = useAuthStore();

  // `promptLogin` defaults on for a plain sign-out, where showing the login
  // screen is the point. Account deletion also routes through here to clear
  // the same cookies/store, but has nothing left to log back into, so it
  // passes `false` to skip the prompt.
  return async (options?: { promptLogin?: boolean }) => {
    // Clear cookies on server
    await clearAuthCookies();

    // Clear client store
    logout();

    if (options?.promptLogin ?? true) {
      openLogin();
    }
    router.push("/");
  };
};

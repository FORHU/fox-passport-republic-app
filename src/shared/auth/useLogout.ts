"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { clearAuthCookies } from "@/shared/lib/server/auth-actions";

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  return async () => {
    // Clear cookies on server
    await clearAuthCookies();

    // Clear client store
    logout();

    // Redirect to home
    router.push("/");
  };
};

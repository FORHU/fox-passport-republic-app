"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { endSession } from "@/shared/auth/endSession";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openLogin } = useAuthStore();

  // `promptLogin` defaults on for a plain sign-out, where showing the login
  // screen is the point. Account deletion also routes through here to clear
  // the same cookies/store, but has nothing left to log back into, so it
  // passes `false` to skip the prompt.
  return async (options?: { promptLogin?: boolean }) => {
    // Server cookies and client store, in that order.
    await endSession();

    // Cached responses too. This is the one sign-out path that navigates
    // client-side, so nothing else drops them: sign in as someone else in the
    // same tab and their screens would paint with the previous account's data
    // until each query refetched. The socket needs no help - SocketProvider
    // disconnects when `isAuthenticated` goes false - but the cache outlives a
    // `push`, which the hard-navigating paths never had to think about.
    queryClient.clear();

    if (options?.promptLogin ?? true) {
      openLogin();
    }
    router.push("/");
  };
};

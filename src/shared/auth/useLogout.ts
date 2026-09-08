"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { endSession } from "@/shared/auth/endSession";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    // Server cookies and client store, in that order.
    await endSession();

    // Cached responses too. This is the one sign-out path that navigates
    // client-side, so nothing else drops them: sign in as someone else in the
    // same tab and their screens would paint with the previous account's data
    // until each query refetched. The socket needs no help - SocketProvider
    // disconnects when `isAuthenticated` goes false - but the cache outlives a
    // `push`, which the hard-navigating paths never had to think about.
    queryClient.clear();

    // Redirect to home
    router.push("/");
  };
};

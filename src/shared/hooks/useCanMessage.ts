"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * Whether the current user is allowed to open a conversation with `targetId`.
 *
 * **Why this is in `shared` and not in `features/messages`.** It answers a
 * question *about* messaging that non-messaging screens have to ask: the public
 * citizen profile shows a "Message" button and needs to know whether to. That
 * made `features/user` import from `features/messages`, which the boundary scan
 * rejects and was rejecting — the app's architecture validator had been failing
 * on exactly this import.
 *
 * It sits beside `useCanPartner`, which is the same shape of question ("may
 * this user do X with that one") and was already answered here for the same
 * reason. The request goes direct rather than through
 * `features/messages/api/messages`, because `shared` may not import from
 * `features` either — that rule is what keeps this layer free of feature
 * cycles, and re-declaring one endpoint is the cheaper side of it.
 */
export const getCanMessage = async (
  userId: string,
): Promise<{ canMessage: boolean }> => {
  const res = await api.get(`/conversations/can-message/${userId}`);
  return res.data.data;
};

export function useCanMessage(targetId?: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["canMessage", targetId],
    queryFn: () => getCanMessage(targetId!),
    // Nobody messages themselves, and an anonymous visitor has no answer to
    // get - both would be a request that can only come back "no".
    enabled: !!targetId && !!user && user.id !== targetId,
  });
}

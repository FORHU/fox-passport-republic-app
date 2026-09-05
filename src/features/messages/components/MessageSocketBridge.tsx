"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SOCKET_EVENTS, subscribeRealtime } from "@/shared/lib/realtime";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import type { Message } from "../types";

/**
 * Turns a socket `new_message` push into this feature's state, a toast, and
 * a click-through to the conversation.
 *
 * Mirrors NotificationSocketBridge: SocketProvider (in shared/) only
 * publishes the payload, since a shared provider must not import a feature.
 * Deciding what a message *is* — the store it lands in, whether to toast,
 * where "View" navigates — happens here, in the feature that owns messages.
 *
 * Mounted from `app/layout.tsx` alongside NotificationSocketBridge.
 */
export default function MessageSocketBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id as string | undefined);
  const addMessage = useMessageStore((state) => state.addMessage);

  useEffect(
    () =>
      subscribeRealtime<Message>(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
        addMessage(message);
        // Not yet routed through DATA_INVALIDATE — see the comment on
        // SOCKET_EVENTS.NEW_MESSAGE.
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        if (message.senderId !== userId) {
          toast.info("New message", {
            description: message.content,
            action: {
              label: "View",
              onClick: () =>
                router.push(`/messages?conversationId=${message.conversationId}`),
            },
          });
        }
      }),
    [addMessage, queryClient, userId, router],
  );

  return null;
}

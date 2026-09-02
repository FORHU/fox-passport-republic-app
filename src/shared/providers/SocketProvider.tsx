"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { disconnectSocket, connectSocket } from "@/shared/lib/socket";
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";
import { useMessageStore } from "@/features/messages/store/useMessageStore";
import api from "@/shared/lib/axios";
import { SOCKET_EVENTS, TOPIC_QUERY_KEYS } from "@/shared/lib/realtime";
import { toast } from "sonner";


export function SocketProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id as string | undefined);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const addMessage = useMessageStore((state) => state.addMessage);
  const queryClient = useQueryClient();

  /**
   * Trades the httpOnly session cookie for a one-minute socket ticket. The
   * request goes through the Next proxy, which is the only thing that can read
   * that cookie - the token itself is never available here, which is why the
   * old `connectSocket(accessToken)` had been dead since tokens left
   * localStorage.
   */
  const fetchTicket = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await api.post("/auth/socket-ticket");
      return data?.data?.ticket ?? data?.ticket ?? null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(fetchTicket);
    socket.connect();

    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification) => {
      addNotification(notification);
      toast.info(notification.message, {
        description: notification.description,
      });
    });

    socket.on(SOCKET_EVENTS.DATA_INVALIDATE, ({ topic }: { topic: string }) => {
      const keys = TOPIC_QUERY_KEYS[topic];
      if (!keys) return;
      for (const queryKey of keys) {
        queryClient.invalidateQueries({ queryKey });
      }
    });

    // Not yet routed through DATA_INVALIDATE — see the comment on
    // SOCKET_EVENTS.NEW_MESSAGE.
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (message.senderId !== userId) {
        toast.info("New message", {
          description: message.content,
          action: {
            label: "View",
            onClick: () =>
              router.push(
                `/messages?conversationId=${message.conversationId}`,
              ),
          },
        });
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
      socket.off(SOCKET_EVENTS.DATA_INVALIDATE);
      socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      disconnectSocket();
    };
  }, [
    isAuthenticated,
    userId,
    addNotification,
    addMessage,
    queryClient,
    fetchTicket,
    router,
  ]);

  return <>{children}</>;
}

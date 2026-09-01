"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { disconnectSocket, connectSocket } from "@/shared/lib/socket";
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";
import api from "@/shared/lib/axios";
import { SOCKET_EVENTS, TOPIC_QUERY_KEYS } from "@/shared/lib/realtime";
import { toast } from "sonner";


export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
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

    return () => {
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
      socket.off(SOCKET_EVENTS.DATA_INVALIDATE);
      disconnectSocket();
    };
  }, [isAuthenticated, addNotification, queryClient, fetchTicket]);

  return <>{children}</>;
}

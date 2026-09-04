"use client";

import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { disconnectSocket, connectSocket } from "@/shared/lib/socket";
import api from "@/shared/lib/axios";
import {
  SOCKET_EVENTS,
  TOPIC_QUERY_KEYS,
  publishRealtime,
} from "@/shared/lib/realtime";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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

    // Published rather than handled here. What a notification *means* -- the
    // store it lands in, the toast it raises -- belongs to
    // features/notifications, and this provider must not import a feature.
    socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification) => {
      publishRealtime(SOCKET_EVENTS.NEW_NOTIFICATION, notification);
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
  }, [isAuthenticated, queryClient, fetchTicket]);

  return <>{children}</>;
}

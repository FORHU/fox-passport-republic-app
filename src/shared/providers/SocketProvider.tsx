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

    // Same publish-only pattern as NEW_NOTIFICATION: deciding what a message
    // means (the store it lands in, the toast, the click-through to
    // /messages) belongs to features/messages, subscribed via
    // MessageSocketBridge. Not yet routed through DATA_INVALIDATE — see the
    // comment on SOCKET_EVENTS.NEW_MESSAGE.
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      publishRealtime(SOCKET_EVENTS.NEW_MESSAGE, message);
    });

    // These four were missing their `socket.on` — added at MESSAGE_DELETED,
    // MESSAGE_REACTION, TYPING, PRESENCE_UPDATE time but never actually
    // subscribed here, so every downstream `subscribeRealtime` listener for
    // them was wired to a bus nothing ever published to.
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (payload) => {
      publishRealtime(SOCKET_EVENTS.MESSAGE_DELETED, payload);
    });
    socket.on(SOCKET_EVENTS.MESSAGE_REACTION, (payload) => {
      publishRealtime(SOCKET_EVENTS.MESSAGE_REACTION, payload);
    });
    socket.on(SOCKET_EVENTS.TYPING, (payload) => {
      publishRealtime(SOCKET_EVENTS.TYPING, payload);
    });
    socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (payload) => {
      publishRealtime(SOCKET_EVENTS.PRESENCE_UPDATE, payload);
    });
    socket.on(SOCKET_EVENTS.GROUP_REMOVED, (payload) => {
      publishRealtime(SOCKET_EVENTS.GROUP_REMOVED, payload);
    });
    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, (payload) => {
      publishRealtime(SOCKET_EVENTS.MESSAGE_EDITED, payload);
    });
    socket.on(SOCKET_EVENTS.READ_RECEIPT, (payload) => {
      publishRealtime(SOCKET_EVENTS.READ_RECEIPT, payload);
    });

    return () => {
      socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
      socket.off(SOCKET_EVENTS.DATA_INVALIDATE);
      socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED);
      socket.off(SOCKET_EVENTS.MESSAGE_REACTION);
      socket.off(SOCKET_EVENTS.TYPING);
      socket.off(SOCKET_EVENTS.PRESENCE_UPDATE);
      socket.off(SOCKET_EVENTS.GROUP_REMOVED);
      socket.off(SOCKET_EVENTS.MESSAGE_EDITED);
      socket.off(SOCKET_EVENTS.READ_RECEIPT);
      disconnectSocket();
    };
  }, [isAuthenticated, queryClient, fetchTicket]);

  return <>{children}</>;
}

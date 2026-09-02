"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { disconnectSocket, connectSocket } from "@/shared/lib/socket";
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";
import { useMessageStore } from "@/features/messages/store/useMessageStore";
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

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    // The socket authenticates via a short-lived token minted on demand
    // (see src/shared/lib/socket.ts) since the real access token lives in an
    // httpOnly cookie the client never reads.
    const socket = connectSocket();
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("new_notification", (notification) => {
      addNotification(notification);
      toast.info(notification.message, {
        description: notification.description,
      });
    });

    socket.on("new_message", (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (message.senderId !== userId) {
        toast.info("New message", {
          description: message.content,
          onClick: () =>
            router.push(`/messages?conversationId=${message.conversationId}`),
        });
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.off("connect");
      socket.off("new_notification");
      socket.off("new_message");
      socket.off("disconnect");
      disconnectSocket();
    };
  }, [isAuthenticated, userId, addNotification, addMessage, queryClient, router]);

  return <>{children}</>;
}

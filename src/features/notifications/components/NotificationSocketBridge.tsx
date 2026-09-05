"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { SOCKET_EVENTS, subscribeRealtime } from "@/shared/lib/realtime";
import { useNotificationStore } from "@/shared/store/useNotificationStore";
import type { Notification } from "@/features/notifications/types";

/**
 * What the server actually sends on `new_notification`.
 *
 * Mirrors `NotificationPayload` in
 * `fox-passport-republic-api/src/infrastructure/socket/socket.types.ts`. It is
 * **narrower than `Notification`**: the socket carries no `title` and no
 * `userId`, because the recipient is whoever the socket belongs to. Typed
 * separately rather than as `Notification` so the gap is visible instead of
 * asserted away — the handler used to be untyped, and that is how the bug below
 * survived.
 */
interface NotificationSocketPayload {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Turns a socket notification into this feature's state and its toast.
 *
 * This used to live inside `shared/providers/SocketProvider`, which meant the
 * shared kernel imported `features/notifications` — the one dependency
 * direction `tools/validate-architecture.mjs` exists to prevent. The provider
 * now owns the connection and publishes; deciding what a notification *is*
 * happens here, in the feature that owns notifications.
 *
 * Renders nothing. Mounted from `app/layout.tsx` alongside `AuthModal` and
 * `SessionExpiredToast`, which is where composition belongs — the app layer may
 * import features, and features may import shared.
 */
export default function NotificationSocketBridge() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(
    () =>
      subscribeRealtime<NotificationSocketPayload>(
        SOCKET_EVENTS.NEW_NOTIFICATION,
        (payload) => {
          // `title` is absent from the socket payload; the list renders
          // `message`, so an empty string is honest rather than inventing one.
          addNotification({
            title: "",
            userId: "",
            ...payload,
          } as Notification);

          // The previous version passed `description: notification.description`.
          // No such field exists on either side of the contract, so that option
          // has always been undefined. Dropped rather than carried forward.
          toast.info(payload.message);
        },
      ),
    [addNotification],
  );

  return null;
}

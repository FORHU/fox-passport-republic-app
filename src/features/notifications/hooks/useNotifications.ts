"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  getNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  type GetNotificationsResult,
} from "@/features/notifications/api/notifications";
import { useNotificationStore } from "../store/useNotificationStore";
import { toast } from "sonner";

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id as string | undefined;
  const queryClient = useQueryClient();
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const storeNotifications = useNotificationStore(
    (state) => state.notifications,
  );
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const storeMarkAsRead = useNotificationStore((state) => state.markAsRead);
  const storeMarkAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: getNotifications,
    enabled: !!userId && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  // Sync fetched data into the Zustand store, so socket-pushed
  // live updates (handled in SocketProvider) and REST-fetched
  // data both flow through the same source of truth

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  const { mutate: markAsRead } = useMutation({
    mutationFn: markNotificationsAsRead,
    onMutate: (id: string) => {
      storeMarkAsRead(id);
      // Keep the query cache in sync with the optimistic store update too —
      // otherwise a remount within `staleTime` (e.g. navigating away and
      // back) re-runs the sync effect below with the old cached `data` and
      // stomps the store's read state right back to unread.
      queryClient.setQueryData<GetNotificationsResult>(
        ["notifications", userId],
        (old) =>
          old && {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
            unreadCount: Math.max(0, old.unreadCount - 1),
          },
      );
    },
    onError: () => {
      toast.error("Could not mark notification as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => {
      storeMarkAllAsRead();
      queryClient.setQueryData<GetNotificationsResult>(
        ["notifications", userId],
        (old) =>
          old && {
            ...old,
            notifications: old.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
            unreadCount: 0,
          },
      );
    },
    onError: () => {
      toast.error("Could not mark all notifications as read");
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  return {
    notifications: storeNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  };
};

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { getConversations } from "@/shared/api/conversations";

/**
 * Total unread messages across every conversation — the badge on the
 * Messages bell / user menu.
 *
 * Backed by the same `["conversations", userId]` query used across the app,
 * so it stays in sync with real-time websocket invalidations.
 */
export function useUnreadMessagesCount() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id as string | undefined;

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: getConversations,
    enabled: !!userId && isAuthenticated,
    staleTime: 1000 * 30,
  });

  const unreadCount = (conversations ?? []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  return { unreadCount, isLoading };
}

"use client";

import { useConversations } from "./useMessages";

/**
 * Total unread messages across every conversation — the badge on the
 * Messages bell, kept separate from `useNotifications`' `unreadCount` (role
 * requests, reports, etc.) rather than folded into it, since the two mean
 * different things to a viewer and are reviewed in different places.
 *
 * Backed by the same `["conversations", userId]` query `useConversations`
 * already runs, so it: fetches as soon as the viewer is authenticated
 * (covers "even right after logging in", not just messages that arrive
 * while connected), and refreshes live — `MessageSocketBridge` invalidates
 * that same query key on every new message and read receipt.
 */
export function useUnreadMessagesCount() {
  const { data: conversations, isLoading } = useConversations();

  const unreadCount = (conversations ?? []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  return { unreadCount, isLoading };
}

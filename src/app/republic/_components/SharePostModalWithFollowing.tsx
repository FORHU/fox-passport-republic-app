"use client";

import { ComponentProps } from "react";
import { SharePostModal } from "@/features/messages/components/SharePostModal";
import { useFollowing } from "@/features/follow/api/useFollow";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * A post's "Send in message" picker, with the people you follow listed
 * alongside your recent chats (as ChatWindowsWrapper does for the chat
 * heads). Composed here because the messages feature can't reach into follow.
 */
export default function SharePostModalWithFollowing(
  props: Omit<ComponentProps<typeof SharePostModal>, "followingUsers">,
) {
  const { user } = useAuthStore();
  const { data: followingPage } = useFollowing(user?.id);
  return <SharePostModal {...props} followingUsers={followingPage?.data} />;
}

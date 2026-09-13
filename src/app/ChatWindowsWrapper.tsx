"use client";

import React from "react";
import ChatWindowsManager from "@/features/messages/components/ChatWindowsManager";
import { useFollowing } from "@/features/follow/api/useFollow";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export default function ChatWindowsWrapper() {
  const { user } = useAuthStore();
  const { data: followingPage } = useFollowing(user?.id);
  return <ChatWindowsManager followingUsers={followingPage?.data} />;
}

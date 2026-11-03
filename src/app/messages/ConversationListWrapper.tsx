"use client";

import React from "react";
import ConversationListClient from "@/features/messages/components/ConversationListClient";
import { useFollowing } from "@/features/follow/api/useFollow";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";

export default function ConversationListWrapper() {
  const { user } = useAuthStore();
  const { data: followingPage } = useFollowing(user?.id);
  return (
    <ConversationListClient
      followingUsers={followingPage?.data}
      renderHeader={() => <LandingHeader />}
    />
  );
}

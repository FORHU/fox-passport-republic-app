"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import PublicCitizenProfileView from "@/features/user/components/PublicCitizenProfileView";
import { FollowButton } from "@/features/follow/components/FollowButton";
import { FollowListModal } from "@/features/follow/components/FollowListModal";
import { useFollowCounts } from "@/features/follow/api/useFollow";
import { BlockMenuButton } from "@/features/block/components/BlockMenuButton";
import { useBlockStatus } from "@/features/block/api/useBlock";

export default function PublicCitizenProfileClient() {
  const { id } = useParams<{ id: string }>();
  const [followListTab, setFollowListTab] = useState<
    "followers" | "following" | null
  >(null);

  const { data: followCounts } = useFollowCounts(id);
  const { data: blockStatus } = useBlockStatus(id);
  const isBlocked = blockStatus?.blockedByMe || blockStatus?.blockedMe;

  return (
    <>
      <PublicCitizenProfileView
        followCounts={followCounts}
        isBlocked={isBlocked}
        onFollowersClick={() => setFollowListTab("followers")}
        onFollowingClick={() => setFollowListTab("following")}
        renderFollowButton={(targetId) => <FollowButton targetId={targetId} />}
        renderBlockMenuButton={(targetId) => (
          <BlockMenuButton targetId={targetId} />
        )}
      />
      {followListTab && id && (
        <FollowListModal
          userId={id}
          initialTab={followListTab}
          onClose={() => setFollowListTab(null)}
        />
      )}
    </>
  );
}

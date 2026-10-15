"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import PublicCitizenProfileView from "@/features/user/components/PublicCitizenProfileView";
import { FollowButton } from "@/features/follow/components/FollowButton";
import { FollowListModal } from "@/features/follow/components/FollowListModal";
import { useFollowCounts } from "@/features/follow/api/useFollow";
import { BlockMenuButton } from "@/features/block/components/BlockMenuButton";
import { useBlockStatus } from "@/features/block/api/useBlock";
import MessageButton from "@/features/messages/components/MessageButton";

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
        renderMessageButton={(targetId, targetName) => (
          <MessageButton
            otherUserId={targetId}
            otherUserName={targetName}
            contextType="profile"
            contextId={targetId}
            contextLabel={targetName}
            label="Message Citizen"
            className="h-9 px-5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
          />
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

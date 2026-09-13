"use client";

import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowing } from "@/features/follow/api/useFollow";
import {
  useBlockStatus,
  useBlockUser,
  useUnblockUser,
} from "@/features/block/api/useBlock";
import { useRemoveFollow } from "@/features/follow/api/useFollow";
import {
  useConversations,
  useStartConversation,
  useLeaveGroupConversation,
  useSetConversationMuted,
  useSetConversationPinned,
  useDeleteConversation,
} from "@/features/messages/hooks/useMessages";
import { useChatWindowsStore } from "@/features/messages/store/useChatWindowsStore";
import { MessageRequestsModal } from "@/features/messages/components/MessageRequestsModal";
import type { Conversation } from "@/features/messages/types";
import { FollowingWidget } from "@/features/republic/components/FollowingWidget";
import { AccountOptionsMenu } from "@/features/republic/components/AccountOptionsMenu";
import { GroupOptionsMenu } from "@/features/republic/components/GroupOptionsMenu";

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

// The composition `app-architecture.md` asks for: `FollowingWidget` (in
// `features/republic`) is pure presentation now, and everything it needs
// from `follow`, `block` and `messages` is wired here instead, since a
// feature reaching into three siblings directly is exactly the boundary
// violation this replaced.
function AccountOptionsMenuContainer({
  targetId,
  conversationId,
  isMuted,
  isPinned,
}: {
  targetId: string;
  conversationId?: string;
  isMuted?: boolean;
  isPinned?: boolean;
}) {
  const { data: blockStatus } = useBlockStatus(targetId);
  const isBlocked = !!(blockStatus?.blockedByMe || blockStatus?.blockedMe);
  const unfollow = useRemoveFollow();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const setMuted = useSetConversationMuted();
  const setPinned = useSetConversationPinned();
  const deleteConversation = useDeleteConversation();
  const closeChat = useChatWindowsStore((s) => s.closeChat);

  return (
    <AccountOptionsMenu
      targetId={targetId}
      conversationId={conversationId}
      isMuted={isMuted}
      isPinned={isPinned}
      isBlocked={isBlocked}
      onUnfollow={() =>
        unfollow.mutate(targetId, {
          onError: (e) => toast.error(errorMessage(e, "Could not unfollow.")),
        })
      }
      onBlock={() =>
        blockUser.mutate(targetId, {
          onError: (e) => toast.error(errorMessage(e, "Could not block user.")),
        })
      }
      onUnblock={() =>
        unblockUser.mutate(targetId, {
          onError: (e) =>
            toast.error(errorMessage(e, "Could not unblock user.")),
        })
      }
      onToggleMute={() => {
        if (!conversationId) return;
        setMuted.mutate(
          { conversationId, muted: !isMuted },
          {
            onError: (e) =>
              toast.error(errorMessage(e, "Could not update mute state.")),
          },
        );
      }}
      onTogglePin={() => {
        if (!conversationId) return;
        setPinned.mutate(
          { conversationId, pinned: !isPinned },
          {
            onError: (e) =>
              toast.error(errorMessage(e, "Could not update pin state.")),
          },
        );
      }}
      onDeleteChat={() => {
        if (!conversationId) return;
        deleteConversation.mutate(conversationId, {
          onSuccess: () => closeChat(targetId),
          onError: (e) =>
            toast.error(errorMessage(e, "Could not delete chat.")),
        });
      }}
    />
  );
}

function GroupOptionsMenuContainer({
  conversationId,
  groupName,
  isMuted,
  isPinned,
}: {
  conversationId: string;
  groupName: string;
  isMuted?: boolean;
  isPinned?: boolean;
}) {
  const leaveGroup = useLeaveGroupConversation();
  const setMuted = useSetConversationMuted();
  const setPinned = useSetConversationPinned();
  const closeChat = useChatWindowsStore((s) => s.closeChat);

  return (
    <GroupOptionsMenu
      conversationId={conversationId}
      groupName={groupName}
      isMuted={isMuted}
      isPinned={isPinned}
      isLeaving={leaveGroup.isPending}
      onLeave={() =>
        leaveGroup.mutate(conversationId, {
          onSuccess: () => closeChat(conversationId),
          onError: (e) =>
            toast.error(errorMessage(e, "Could not leave group.")),
        })
      }
      onToggleMute={() =>
        setMuted.mutate(
          { conversationId, muted: !isMuted },
          {
            onError: (e) =>
              toast.error(errorMessage(e, "Could not update mute state.")),
          },
        )
      }
      onTogglePin={() =>
        setPinned.mutate(
          { conversationId, pinned: !isPinned },
          {
            onError: (e) =>
              toast.error(errorMessage(e, "Could not update pin state.")),
          },
        )
      }
    />
  );
}

export default function FollowingWidgetSection() {
  const { user } = useAuthStore();
  const { data, isLoading } = useFollowing(user?.id);
  const following = data?.data ?? [];

  const { data: conversations = [] } = useConversations();
  const incomingRequestsCount = conversations.filter(
    (c) => c.isIncomingRequest,
  ).length;

  const openChatWindow = useChatWindowsStore((s) => s.openChat);
  const openGroupChatWindow = useChatWindowsStore((s) => s.openGroupChat);
  const setConversationId = useChatWindowsStore((s) => s.setConversationId);
  const startConversation = useStartConversation();

  const handleOpenChat = (target: {
    id: string;
    name: string;
    imgId: string | null;
    isIncomingRequest?: boolean;
  }) => {
    openChatWindow({
      otherUserId: target.id,
      otherUserName: target.name,
      otherUserImgId: target.imgId,
      isIncomingRequest: target.isIncomingRequest,
    });
    startConversation.mutate(
      { otherUserId: target.id },
      {
        onSuccess: (conversation) =>
          setConversationId(target.id, conversation.id),
        onError: (e) => {
          toast.error(errorMessage(e, "Could not start this conversation."));
        },
      },
    );
  };

  const handleOpenGroup = (conversation: Conversation) => {
    openGroupChatWindow({
      conversationId: conversation.id,
      name: conversation.name ?? "Group",
      participants: conversation.participants ?? [],
      creatorId: conversation.creatorId,
      imgId: conversation.imgId,
    });
  };

  const handleSelectRequest = (
    conversation: Conversation,
    closeModal: () => void,
  ) => {
    if (!conversation.otherUser) return;
    closeModal();
    handleOpenChat({
      id: conversation.otherUser.id,
      name: conversation.otherUser.name || "Citizen",
      imgId: conversation.otherUser.imgId,
      isIncomingRequest: true,
    });
  };

  return (
    <FollowingWidget
      isLoading={isLoading}
      following={following}
      conversations={conversations}
      incomingRequestsCount={incomingRequestsCount}
      onOpenChat={handleOpenChat}
      onOpenGroup={handleOpenGroup}
      messageRequestsModalSlot={(closeModal) => (
        <MessageRequestsModal
          onClose={closeModal}
          onSelectRequest={(conversation) =>
            handleSelectRequest(conversation, closeModal)
          }
        />
      )}
      accountOptionsRender={(targetId, conversationId, isMuted, isPinned) => (
        <AccountOptionsMenuContainer
          targetId={targetId}
          conversationId={conversationId}
          isMuted={isMuted}
          isPinned={isPinned}
        />
      )}
      groupOptionsRender={(conversationId, groupName, isMuted, isPinned) => (
        <GroupOptionsMenuContainer
          conversationId={conversationId}
          groupName={groupName}
          isMuted={isMuted}
          isPinned={isPinned}
        />
      )}
    />
  );
}

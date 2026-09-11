/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Mail, MessagesSquare, Users, Pin, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowing } from "@/features/follow/api/useFollow";
import {
  useConversations,
  useStartConversation,
  useLeaveGroupConversation,
} from "@/features/messages/hooks/useMessages";
import { useChatWindowsStore } from "@/features/messages/store/useChatWindowsStore";
import { MessageRequestsModal } from "@/features/messages/components/MessageRequestsModal";
import type { Conversation } from "@/features/messages/types";
import { AccountOptionsMenu } from "./AccountOptionsMenu";
import { GroupOptionsMenu } from "./GroupOptionsMenu";

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

interface RowUser {
  isGroup: false;
  id: string;
  name: string;
  imgId: string | null;
}

interface RowGroup {
  isGroup: true;
  id: string;
  name: string;
  conversation: Conversation;
}

type Row = RowUser | RowGroup;

export function FollowingWidget() {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useFollowing(user?.id);
  const following = data?.data ?? [];

  // Keyed by the other participant's id so each row can show its own last
  // message instead of the username — the same conversations list the
  // Messages page/widget already fetches, just cross-referenced here.
  const { data: allConversations = [] } = useConversations();
  const conversations = allConversations.filter((c) => !c.isGroup);
  const groupConversations = allConversations.filter((c) => c.isGroup);
  const conversationByUserId = new Map(
    conversations.map((c) => [c.otherUser!.id, c]),
  );
  const incomingRequestsCount = allConversations.filter(
    (c) => c.isIncomingRequest,
  ).length;

  // Rows are "who you follow" plus "who you have an accepted conversation
  // with" (e.g. someone whose message request you just accepted) — the
  // latter matters because accepting a request doesn't also follow them,
  // so without this an accepted conversation with a non-followed account
  // would have nowhere to show. Pending requests are deliberately excluded
  // here; those live only in the Message Requests folder until accepted.
  const followingRows: RowUser[] = following.map((u) => ({
    isGroup: false,
    id: u.id,
    name: u.name || "Unknown Citizen",
    imgId: u.imgId,
  }));
  const followingIds = new Set(followingRows.map((r) => r.id));
  const acceptedNonFollowedRows: RowUser[] = conversations
    .filter(
      (c) => c.status === "accepted" && !followingIds.has(c.otherUser!.id),
    )
    .map((c) => ({
      isGroup: false,
      id: c.otherUser!.id,
      name: c.otherUser!.name || "Unknown Citizen",
      imgId: c.otherUser!.imgId,
    }));
  const groupRows: RowGroup[] = groupConversations.map((c) => ({
    isGroup: true,
    id: c.id,
    name: c.name || "Group",
    conversation: c,
  }));

  // Pinned rows float to the top first (most-recently-pinned first), then
  // accounts/groups with a recent conversation (most recent first), same as
  // a normal chat app's contact list — everyone else keeps their existing
  // relative order.
  const rows: Row[] = [
    ...followingRows,
    ...acceptedNonFollowedRows,
    ...groupRows,
  ].sort((a, b) => {
    const aConv = a.isGroup ? a.conversation : conversationByUserId.get(a.id);
    const bConv = b.isGroup ? b.conversation : conversationByUserId.get(b.id);
    if (!!aConv?.isPinned !== !!bConv?.isPinned) {
      return aConv?.isPinned ? -1 : 1;
    }
    if (aConv?.isPinned && bConv?.isPinned) {
      return (
        new Date(bConv.pinnedAt ?? 0).getTime() -
        new Date(aConv.pinnedAt ?? 0).getTime()
      );
    }
    const aTime = aConv?.lastMessageAt;
    const bTime = bConv?.lastMessageAt;
    if (aTime && bTime) {
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    }
    if (aTime) return -1;
    if (bTime) return 1;
    return 0;
  });

  const [requestsOpen, setRequestsOpen] = useState(false);
  const openChatWindow = useChatWindowsStore((s) => s.openChat);
  const openGroupChatWindow = useChatWindowsStore((s) => s.openGroupChat);
  const setConversationId = useChatWindowsStore((s) => s.setConversationId);
  const closeChat = useChatWindowsStore((s) => s.closeChat);
  const startConversation = useStartConversation();
  const leaveGroup = useLeaveGroupConversation();

  const openGroup = (conversation: Conversation) => {
    openGroupChatWindow({
      conversationId: conversation.id,
      name: conversation.name ?? "Group",
      participants: conversation.participants ?? [],
      creatorId: conversation.creatorId,
      imgId: conversation.imgId,
    });
  };

  const handleLeaveGroup = (conversationId: string) => {
    leaveGroup.mutate(conversationId, {
      onSuccess: () => closeChat(conversationId),
      onError: (e) => toast.error(errorMessage(e, "Could not leave group.")),
    });
  };

  const openChat = (target: {
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

  const handleSelectRequest = (conversation: Conversation) => {
    if (!conversation.otherUser) return;
    setRequestsOpen(false);
    openChat({
      id: conversation.otherUser.id,
      name: conversation.otherUser.name || "Citizen",
      imgId: conversation.otherUser.imgId,
      isIncomingRequest: true,
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="h-full rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-4 animate-pulse">
        <div className="h-3 w-32 bg-zinc-800 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded"></div>
              <div className="h-2 w-16 bg-zinc-800 rounded"></div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return null;

  return (
    <>
      {/* h-full so this panel stretches to fill whatever height its sticky
          container gives it, instead of shrink-wrapping to just its content —
          the list scrolls internally if it's longer than that; the card
          still reaches the bottom of the available space either way. */}
      <div className="h-full flex flex-col rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4">
        <div className="flex items-center gap-2 shrink-0">
          <MessagesSquare className="h-4 w-4 text-lime-400" strokeWidth={2} />
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Message Your Following
          </div>
        </div>

        {/* Message Requests — its own "folder", not surfaced inline in the
            list below, and only shown at all when there's something waiting
            in it — a reminder, not a permanent fixture. */}
        {incomingRequestsCount > 0 && (
          <button
            type="button"
            onClick={() => setRequestsOpen(true)}
            className="mt-3 shrink-0 w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-lime-400/40 transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
              <Mail
                className="h-4 w-4 text-zinc-500 group-hover:text-lime-400 transition-colors"
                strokeWidth={2}
              />
              Message Requests
            </span>
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-lime-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">
              {incomingRequestsCount}
            </span>
          </button>
        )}

        {rows.length === 0 ? (
          <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
            You&apos;re not following anyone yet. Follow citizens and partners
            from their posts or profiles to see them here.
          </p>
        ) : (
          <div className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {rows.map((followedUser) => {
              if (followedUser.isGroup) {
                const { conversation } = followedUser;
                const lastMessage = conversation.lastMessage;
                const preview = lastMessage
                  ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}`
                  : "Click to start chatting";
                const hasUnread = conversation.unreadCount > 0;

                return (
                  <div
                    key={followedUser.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => openGroup(conversation)}
                      className="flex items-center gap-3 min-w-0 group text-left cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/50 group-hover:border-lime-500/50 transition-colors flex items-center justify-center text-zinc-500">
                          {conversation.imgId ? (
                            <img
                              src={conversation.imgId}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4" strokeWidth={2} />
                          )}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 border-2 border-zinc-950" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="flex items-center gap-1 min-w-0">
                          {conversation.isPinned && (
                            <Pin className="h-3 w-3 shrink-0 text-lime-400/70" />
                          )}
                          <span
                            className={`text-xs truncate transition-colors ${hasUnread ? "font-black text-white" : "font-bold text-zinc-200 group-hover:text-lime-400"}`}
                          >
                            {followedUser.name}
                          </span>
                          {conversation.isMuted && (
                            <BellOff className="h-3 w-3 shrink-0 text-zinc-500" />
                          )}
                        </span>
                        <span
                          className={`text-[10px] truncate ${hasUnread ? "text-zinc-200 font-semibold" : "text-zinc-500"}`}
                        >
                          {preview}
                        </span>
                      </div>
                    </button>

                    <GroupOptionsMenu
                      conversationId={conversation.id}
                      groupName={followedUser.name}
                      isMuted={conversation.isMuted}
                      isPinned={conversation.isPinned}
                      onLeave={() => handleLeaveGroup(conversation.id)}
                      isLeaving={leaveGroup.isPending}
                    />
                  </div>
                );
              }

              // A pending request they sent *to* you is deliberately not
              // reflected here — it only shows inside the Message Requests
              // folder above until you accept it.
              const conversation = conversationByUserId.get(followedUser.id);
              const isPendingIncoming =
                conversation?.isIncomingRequest ?? false;
              const lastMessage = isPendingIncoming
                ? undefined
                : conversation?.lastMessage;
              const preview = lastMessage
                ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}`
                : "Click to start chatting";
              // A request you sent that they haven't accepted yet — same
              // "Pending" tag the /messages page shows for it.
              const isPendingSent =
                !isPendingIncoming && conversation?.status === "pending";
              const hasUnread =
                !isPendingIncoming && (conversation?.unreadCount ?? 0) > 0;

              return (
                <div
                  key={followedUser.id}
                  className="flex items-center justify-between gap-2"
                >
                  {/* Clicking the account itself opens the message composer —
                    the 3-dot menu still has View Profile for navigating
                    away instead. */}
                  <button
                    type="button"
                    onClick={() =>
                      openChat({
                        id: followedUser.id,
                        name: followedUser.name || "Citizen",
                        imgId: followedUser.imgId,
                      })
                    }
                    className="flex items-center gap-3 min-w-0 group text-left cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/50 group-hover:border-lime-500/50 transition-colors">
                        {followedUser.imgId ? (
                          <img
                            src={
                              followedUser.imgId.startsWith("http://") ||
                              followedUser.imgId.startsWith("https://")
                                ? followedUser.imgId
                                : `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${followedUser.imgId}`
                            }
                            alt={followedUser.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                            {followedUser.name
                              ? followedUser.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                        )}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 border-2 border-zinc-950" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="flex items-center gap-1.5 min-w-0">
                        {conversation?.isPinned && (
                          <Pin className="h-3 w-3 shrink-0 text-lime-400/70" />
                        )}
                        <span
                          className={`text-xs truncate transition-colors ${hasUnread ? "font-black text-white" : "font-bold text-zinc-200 group-hover:text-lime-400"}`}
                        >
                          {followedUser.name || "Unknown Citizen"}
                        </span>
                        {conversation?.isMuted && (
                          <BellOff className="h-3 w-3 shrink-0 text-zinc-500" />
                        )}
                        {isPendingSent && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-400/80 shrink-0">
                            Pending
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] truncate ${hasUnread ? "text-zinc-200 font-semibold" : "text-zinc-500"}`}
                      >
                        {preview}
                      </span>
                    </div>
                  </button>

                  <AccountOptionsMenu
                    targetId={followedUser.id}
                    conversationId={conversation?.id}
                    isMuted={conversation?.isMuted}
                    isPinned={conversation?.isPinned}
                    onChatDeleted={() => closeChat(followedUser.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {requestsOpen && (
        <MessageRequestsModal
          onClose={() => setRequestsOpen(false)}
          onSelectRequest={handleSelectRequest}
        />
      )}
    </>
  );
}

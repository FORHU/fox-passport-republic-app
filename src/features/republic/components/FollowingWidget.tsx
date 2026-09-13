"use client";

import { useState } from "react";
import { Mail, MessagesSquare, Users, Pin, BellOff } from "lucide-react";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export interface FollowingWidgetProps {
  isLoading?: boolean;
  following: Array<{
    id: string;
    name: string | null;
    imgId: string | null;
  }>;
  conversations: Array<{
    id: string;
    isGroup: boolean;
    name?: string | null;
    imgId?: string | null;
    otherUser?: {
      id: string;
      name: string | null;
      imgId: string | null;
    } | null;
    status: string;
    isIncomingRequest?: boolean;
    lastMessageAt?: string | null;
    isPinned?: boolean;
    pinnedAt?: string | null;
    isMuted?: boolean;
    unreadCount: number;
    lastMessage?: { content: string; isMine: boolean } | null;
    participants?: { id: string; name: string; imgId: string | null }[];
    creatorId?: string;
  }>;
  incomingRequestsCount: number;

  /** A render prop, not a static node, because the modal's own `onClose`
   * needs to reach back into this component's `requestsOpen` state — the
   * caller doesn't own that state, so it's handed the closer instead. */
  messageRequestsModalSlot?: (closeModal: () => void) => React.ReactNode;

  onOpenChat: (target: {
    id: string;
    name: string;
    imgId: string | null;
    isIncomingRequest?: boolean;
  }) => void;
  onOpenGroup: (conversation: any) => void;

  accountOptionsRender: (
    targetId: string,
    conversationId?: string,
    isMuted?: boolean,
    isPinned?: boolean,
  ) => React.ReactNode;
  groupOptionsRender: (
    conversationId: string,
    groupName: string,
    isMuted?: boolean,
    isPinned?: boolean,
  ) => React.ReactNode;
}

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
  conversation: any;
}

type Row = RowUser | RowGroup;

export function FollowingWidget({
  isLoading,
  following,
  conversations: allConversations,
  incomingRequestsCount,
  messageRequestsModalSlot,
  onOpenChat,
  onOpenGroup,
  accountOptionsRender,
  groupOptionsRender,
}: FollowingWidgetProps) {
  const { user } = useAuthStore();

  const conversations = allConversations.filter((c) => !c.isGroup);
  const groupConversations = allConversations.filter((c) => c.isGroup);
  const conversationByUserId = new Map(
    conversations.map((c) => [c.otherUser!.id, c]),
  );

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

  return (
    <>
      <div className="h-full flex flex-col rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4">
        <div className="flex items-center gap-2 shrink-0">
          <MessagesSquare className="h-4 w-4 text-lime-400" strokeWidth={2} />
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Message Your Following
          </div>
        </div>

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
                      onClick={() => onOpenGroup(conversation)}
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

                    {groupOptionsRender(
                      conversation.id,
                      followedUser.name,
                      conversation.isMuted,
                      conversation.isPinned,
                    )}
                  </div>
                );
              }

              const conversation = conversationByUserId.get(followedUser.id);
              const isPendingIncoming =
                conversation?.isIncomingRequest ?? false;
              const lastMessage = isPendingIncoming
                ? undefined
                : conversation?.lastMessage;
              const preview = lastMessage
                ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}`
                : "Click to start chatting";
              const isPendingSent =
                !isPendingIncoming && conversation?.status === "pending";
              const hasUnread =
                !isPendingIncoming && (conversation?.unreadCount ?? 0) > 0;

              return (
                <div
                  key={followedUser.id}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onOpenChat({
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

                  {accountOptionsRender(
                    followedUser.id,
                    conversation?.id,
                    conversation?.isMuted,
                    conversation?.isPinned,
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {requestsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {messageRequestsModalSlot?.(() => setRequestsOpen(false))}
        </div>
      )}
    </>
  );
}

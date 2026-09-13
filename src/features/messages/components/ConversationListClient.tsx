/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Users, Pin, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  useConversations,
  useStartConversation,
  useAcceptConversationRequest,
  useDeclineConversationRequest,
} from "../hooks/useMessages";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useChatWindowsStore } from "../store/useChatWindowsStore";
import { NewGroupModal } from "./NewGroupModal";
import type { Conversation, Candidate } from "../types";

interface ConversationListClientProps {
  followingUsers?: Candidate[];
}

export default function ConversationListClient({
  followingUsers,
}: ConversationListClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: conversations = [], isLoading } = useConversations();
  const openChatWindow = useChatWindowsStore((s) => s.openChat);
  const openGroupChatWindow = useChatWindowsStore((s) => s.openGroupChat);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const openConversation = (c: Conversation) => {
    if (c.isGroup) {
      openGroupChatWindow({
        conversationId: c.id,
        name: c.name ?? "Group",
        participants: c.participants ?? [],
        creatorId: c.creatorId,
        imgId: c.imgId,
      });
      return;
    }
    if (!c.otherUser) return;
    openChatWindow({
      otherUserId: c.otherUser.id,
      otherUserName: c.otherUser.name,
      otherUserImgId: c.otherUser.imgId,
      contextLabel: c.contextLabel ?? undefined,
      isIncomingRequest: c.isIncomingRequest,
      conversationId: c.id,
    });
  };

  // Get-or-creates a conversation for ?userId=, the link shape used by
  // PostCard, PartnerInventoryMap, PublicCitizenProfileView, and the
  // Message Foxer/Client/Provider/Organizer links across the app. This is
  // a real network call, so it runs in an effect rather than during render;
  // startConversation only returns the new id, so once it resolves we fold
  // it into the same conversationId-matching flow below.
  const userIdParam = searchParams.get("userId");
  const contextTypeParam = searchParams.get("contextType") ?? undefined;
  const contextIdParam = searchParams.get("contextId") ?? undefined;
  const contextLabelParam = searchParams.get("contextLabel") ?? undefined;
  const [startedUserId, setStartedUserId] = useState<string | null>(null);
  const [pendingConversationId, setPendingConversationId] = useState<
    string | null
  >(null);
  const startConversation = useStartConversation();
  useEffect(() => {
    // Unlike `useConversations` (gated on `isAuthenticated` in its own
    // `enabled`), this fired unconditionally on mount — on a fresh page
    // load, auth rehydration and this effect can run in either order, so a
    // request could go out before the store (and the request it depends on
    // downstream) is actually ready. Waiting for `isAuthenticated` here
    // means the effect re-fires once auth settles instead of racing it.
    if (!isAuthenticated || !userIdParam || userIdParam === startedUserId)
      return;
    setStartedUserId(userIdParam);
    startConversation.mutate(
      {
        otherUserId: userIdParam,
        contextType: contextTypeParam,
        contextId: contextIdParam,
        contextLabel: contextLabelParam,
      },
      {
        onSuccess: (conversation) => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          setPendingConversationId(conversation.id);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Could not start this conversation.",
          );
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userIdParam, startedUserId]);

  // Opens the conversation named by ?conversationId, or the one just
  // started for ?userId=, once it's in the list. This has to be an effect
  // rather than the render-time update used elsewhere in this file (e.g.
  // SearchFilters.tsx's technique) — it now reaches into the *global* chat
  // windows store, and updating a different component's (ChatWindowsManager)
  // subscribed state while this component is still rendering is exactly the
  // "Cannot update a component while rendering a different component" case
  // React warns about; local setState doesn't have that problem, but this
  // does.
  const targetConversationId =
    searchParams.get("conversationId") ?? pendingConversationId;
  const [appliedConversationId, setAppliedConversationId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (!targetConversationId || targetConversationId === appliedConversationId)
      return;
    const match = conversations.find((c) => c.id === targetConversationId);
    if (match) {
      setAppliedConversationId(targetConversationId);
      openConversation(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetConversationId, appliedConversationId, conversations]);

  // Incoming requests (someone else messaged you with no existing
  // relationship) get their own section, separate from the normal inbox —
  // same split as Instagram/Messenger requests.
  const requests = conversations.filter((c) => c.isIncomingRequest);
  const threads = conversations.filter((c) => !c.isIncomingRequest);

  const acceptRequest = useAcceptConversationRequest();
  const declineRequest = useDeclineConversationRequest();

  const handleAccept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acceptRequest.mutate(id, {
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message || "Could not accept this request.",
        ),
    });
  };

  const handleDecline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    declineRequest.mutate(id, {
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message || "Could not decline this request.",
        ),
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
            Back
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-display font-bold text-white">
            Messages
          </h1>
          <button
            type="button"
            onClick={() => setNewGroupOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer"
          >
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            New Group
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30 text-center">
            <MessageCircle className="h-16 w-16" strokeWidth={1.5} />
            <p className="text-sm text-white/60">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {requests.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-white/40 px-1">
                  Message Requests
                </h2>
                {requests.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#ccff00]/20 bg-[#ccff00]/5 hover:bg-[#ccff00]/10 transition-colors text-left"
                  >
                    <div className="h-11 w-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                      {c.otherUser?.imgId ? (
                        <img
                          src={c.otherUser.imgId}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        c.otherUser?.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {c.otherUser?.name}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {c.lastMessage
                          ? c.lastMessage.content
                          : (c.contextLabel ?? "Sent you a message request")}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleAccept(c.id, e)}
                        disabled={acceptRequest.isPending}
                        className="h-8 px-3 rounded-lg bg-[#ccff00] text-black text-xs font-black hover:bg-[#b8e600] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => handleDecline(c.id, e)}
                        disabled={declineRequest.isPending}
                        className="h-8 px-3 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/15 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {threads.length > 0 && (
              <div className="space-y-2">
                {requests.length > 0 && (
                  <h2 className="text-xs font-black uppercase tracking-wider text-white/40 px-1">
                    Messages
                  </h2>
                )}
                {threads.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-11 w-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                      {c.isGroup ? (
                        c.imgId ? (
                          <img
                            src={c.imgId}
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        ) : (
                          <Users className="h-4 w-4" strokeWidth={2} />
                        )
                      ) : c.otherUser?.imgId ? (
                        <img
                          src={c.otherUser.imgId}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        c.otherUser?.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="flex items-center gap-1.5 min-w-0">
                        {c.isPinned && (
                          <Pin className="h-3 w-3 shrink-0 text-[#ccff00]/70" />
                        )}
                        <span className="font-bold text-white text-sm truncate">
                          {c.isGroup ? c.name : c.otherUser?.name}
                        </span>
                        {c.isMuted && (
                          <BellOff className="h-3 w-3 shrink-0 text-white/30" />
                        )}
                      </p>
                      {(c.lastMessage || c.contextLabel) && (
                        <p className="text-[11px] text-white/40 truncate">
                          {c.lastMessage
                            ? `${c.lastMessage.isMine ? "You: " : ""}${c.lastMessage.content}`
                            : c.contextLabel}
                        </p>
                      )}
                    </div>
                    {c.status === "pending" ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 shrink-0">
                        Pending
                      </span>
                    ) : (
                      c.unreadCount > 0 && (
                        <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#ff00aa] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {c.unreadCount}
                        </span>
                      )
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {newGroupOpen && (
        <NewGroupModal
          onClose={() => setNewGroupOpen(false)}
          onCreated={(conversation) => {
            setNewGroupOpen(false);
            openConversation(conversation);
          }}
          followingUsers={followingUsers}
        />
      )}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConversations, useStartConversation } from "../hooks/useMessages";
import ChatPanel from "./ChatPanel";
import type { Conversation } from "../types";

export default function ConversationListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useConversations();
  const [active, setActive] = useState<Conversation | null>(null);

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
    if (!userIdParam || userIdParam === startedUserId) return;
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
  }, [userIdParam, startedUserId]);

  // Opens the conversation named by ?conversationId, or the one just
  // started for ?userId=, once it's in the list — adjusted during render
  // (see SearchFilters.tsx for the same technique) rather than in an
  // effect, so a still-loading/still-refetching `conversations` naturally
  // retries on the next render instead of needing a second effect run.
  const targetConversationId =
    searchParams.get("conversationId") ?? pendingConversationId;
  const [appliedConversationId, setAppliedConversationId] = useState<
    string | null
  >(null);
  if (targetConversationId && targetConversationId !== appliedConversationId) {
    const match = conversations.find((c) => c.id === targetConversationId);
    if (match) {
      setAppliedConversationId(targetConversationId);
      setActive(match);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back
          </button>
        </div>

        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Messages
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30 text-center">
            <span className="material-symbols-outlined text-6xl">
              chat_bubble
            </span>
            <p className="text-sm text-white/60">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors text-left"
              >
                <div className="h-11 w-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                  {c.otherUser.imgId ? (
                    <img
                      src={c.otherUser.imgId}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    c.otherUser.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {c.otherUser.name}
                  </p>
                  {c.contextLabel && (
                    <p className="text-[11px] text-white/40 truncate">
                      {c.contextLabel}
                    </p>
                  )}
                </div>
                {c.unreadCount > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#ff00aa] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <ChatPanel
        open={!!active}
        onOpenChange={(open) => !open && setActive(null)}
        conversationId={active?.id}
        otherUserName={active?.otherUser.name ?? ""}
        otherUserImgId={active?.otherUser.imgId}
        contextLabel={active?.contextLabel ?? undefined}
      />
    </div>
  );
}

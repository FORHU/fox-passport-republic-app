/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConversations } from "../hooks/useMessages";
import ChatPanel from "./ChatPanel";
import type { Conversation } from "../types";

export default function ConversationListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: conversations = [], isLoading } = useConversations();
  const [active, setActive] = useState<Conversation | null>(null);

  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return;
    const match = conversations.find((c) => c.id === conversationId);
    if (match) setActive(match);
  }, [searchParams, conversations]);

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

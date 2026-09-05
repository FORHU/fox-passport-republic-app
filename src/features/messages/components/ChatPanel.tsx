/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  useMessagesForConversation,
  useSendMessage,
  useMarkMessagesRead,
} from "../hooks/useMessages";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
  otherUserName: string;
  otherUserImgId?: string | null;
  contextLabel?: string;
}

export default function ChatPanel({
  open,
  onOpenChange,
  conversationId,
  otherUserName,
  otherUserImgId,
  contextLabel,
}: ChatPanelProps) {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id as string | undefined;
  const { messages, isLoading } = useMessagesForConversation(conversationId);
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (open && conversationId && markedRef.current !== conversationId) {
      markedRef.current = conversationId;
      markReadMutation.mutate(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || !conversationId || sendMutation.isPending) return;
    sendMutation.mutate(
      { conversationId, content: trimmed },
      { onSuccess: () => setContent("") },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[#0a0a0a] border-white/10 w-full sm:max-w-md p-0"
      >
        <SheetHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
              {otherUserImgId ? (
                <img
                  src={otherUserImgId}
                  className="h-full w-full object-cover"
                  alt=""
                />
              ) : (
                otherUserName?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-white text-base truncate">
                {otherUserName}
              </SheetTitle>
              {contextLabel && (
                <p className="text-[11px] text-white/40 truncate">
                  {contextLabel}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!conversationId || isLoading ? (
            <div className="flex items-center justify-center py-12 text-white/30 text-sm">
              Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center opacity-40">
              <span className="material-symbols-outlined text-4xl">
                chat_bubble
              </span>
              <p className="text-sm text-white/60">No messages yet</p>
              <p className="text-xs text-white/40">
                Say hello to get things started.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? "bg-[#ccff00] text-black rounded-br-sm"
                        : "bg-white/10 text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    <p
                      className={`text-[9px] mt-1 ${isMine ? "text-black/50" : "text-white/30"}`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <SheetFooter className="border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message…"
              disabled={!conversationId}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/40 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!conversationId || !content.trim() || sendMutation.isPending}
              className="h-10 w-10 rounded-xl bg-[#ccff00] text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">
                send
              </span>
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

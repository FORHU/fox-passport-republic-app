"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import ChatPanel from "./ChatPanel";
import { useStartConversation } from "../hooks/useMessages";

interface MessageButtonProps {
  otherUserId: string;
  otherUserName: string;
  otherUserImgId?: string | null;
  contextType?: string;
  contextId?: string;
  contextLabel?: string;
  className?: string;
  label?: string;
}

// Owns the open/closed state for a ChatPanel and lazily gets-or-creates the
// conversation on first open, so callers just drop this in wherever a
// relationship with another user already exists in the UI.
export default function MessageButton({
  otherUserId,
  otherUserName,
  otherUserImgId,
  contextType,
  contextId,
  contextLabel,
  className,
  label = "Message",
}: MessageButtonProps) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const startConversation = useStartConversation();

  const handleOpen = () => {
    setOpen(true);
    if (!conversationId) {
      startConversation.mutate(
        { otherUserId, contextType, contextId, contextLabel },
        {
          onSuccess: (conversation) => setConversationId(conversation.id),
          onError: (error: any) => {
            setOpen(false);
            toast.error(
              error?.response?.data?.message ||
                "Could not start this conversation.",
            );
          },
        },
      );
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={
          className ??
          "flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-all shrink-0"
        }
      >
        <span className="material-symbols-outlined text-[16px]">
          chat_bubble
        </span>
        {label}
      </button>
      <ChatPanel
        open={open}
        onOpenChange={setOpen}
        conversationId={conversationId}
        otherUserName={otherUserName}
        otherUserImgId={otherUserImgId}
        contextLabel={contextLabel}
      />
    </>
  );
}

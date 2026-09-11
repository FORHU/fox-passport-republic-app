"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useStartConversation } from "../hooks/useMessages";
import { useChatWindowsStore } from "../store/useChatWindowsStore";

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

// Opens (or focuses, if already open) this person's chat window in the
// global ChatWindowsManager, lazily getting-or-creating the conversation on
// first open, so callers just drop this in wherever a relationship with
// another user already exists in the UI.
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
  const openChat = useChatWindowsStore((s) => s.openChat);
  const setConversationId = useChatWindowsStore((s) => s.setConversationId);
  const startConversation = useStartConversation();

  const handleOpen = () => {
    openChat({ otherUserId, otherUserName, otherUserImgId, contextLabel });
    startConversation.mutate(
      { otherUserId, contextType, contextId, contextLabel },
      {
        onSuccess: (conversation) =>
          setConversationId(otherUserId, conversation.id),
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "Could not start this conversation.",
          );
        },
      },
    );
  };

  return (
    <button
      onClick={handleOpen}
      className={
        className ??
        "flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-all shrink-0"
      }
    >
      <MessageCircle className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}

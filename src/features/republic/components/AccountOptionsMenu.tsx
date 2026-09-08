"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  UserRound,
  MessageCircle,
  UserMinus,
  Flag,
  Ban,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useRemoveFollow } from "@/features/follow/api/useFollow";
import { useBlockStatus, useBlockUser, useUnblockUser } from "@/features/block/api/useBlock";
import { useStartConversation } from "@/features/messages/hooks/useMessages";
import ChatPanel from "@/features/messages/components/ChatPanel";

interface AccountOptionsMenuProps {
  targetId: string;
  targetName: string;
  targetImgId?: string | null;
}

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

// One "more options" menu covering everything you'd want to do with an
// account you already follow — view, message, unfollow, report, block —
// instead of a single-purpose follow/unfollow icon button.
export function AccountOptionsMenu({
  targetId,
  targetName,
  targetImgId,
}: AccountOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: blockStatus } = useBlockStatus(targetId);
  const removeFollow = useRemoveFollow();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const startConversation = useStartConversation();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const isBlocked = blockStatus?.blockedByMe ?? false;
  const isBusy =
    removeFollow.isPending || blockUser.isPending || unblockUser.isPending;

  const handleMessage = () => {
    setOpen(false);
    setChatOpen(true);
    if (!conversationId) {
      startConversation.mutate(
        { otherUserId: targetId },
        {
          onSuccess: (conversation) => setConversationId(conversation.id),
          onError: (e) => {
            setChatOpen(false);
            toast.error(
              errorMessage(e, "Could not start this conversation."),
            );
          },
        },
      );
    }
  };

  const handleReport = () => {
    setOpen(false);
    // No report backend exists yet — this surfaces the intent honestly
    // rather than pretending something was filed.
    toast("Reporting isn't available yet", {
      description: "This account will be flagged for review once reporting ships.",
    });
  };

  const handleUnfollow = () => {
    setOpen(false);
    removeFollow.mutate(targetId, {
      onError: (e) => toast.error(errorMessage(e, "Failed to unfollow")),
    });
  };

  const handleBlock = () => {
    setOpen(false);
    blockUser.mutate(targetId, {
      onError: (e) =>
        toast.error(errorMessage(e, "Could not block this citizen.")),
    });
  };

  const handleUnblock = () => {
    setOpen(false);
    unblockUser.mutate(targetId, {
      onError: (e) =>
        toast.error(errorMessage(e, "Could not unblock this citizen.")),
    });
  };

  return (
    <>
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={isBusy}
          aria-label="Account options"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 transition-all disabled:opacity-50 cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 py-1">
            <Link
              href={`/user/${targetId}`}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <UserRound className="w-4 h-4" />
              View Profile
            </Link>
            <button
              type="button"
              onClick={handleMessage}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <button
              type="button"
              onClick={handleUnfollow}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <UserMinus className="w-4 h-4" />
              Unfollow
            </button>
            <div className="my-1 border-t border-zinc-800" />
            <button
              type="button"
              onClick={handleReport}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Report
            </button>
            {isBlocked ? (
              <button
                type="button"
                onClick={handleUnblock}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Unblock
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBlock}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Block
              </button>
            )}
          </div>
        )}
      </div>

      <ChatPanel
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversationId={conversationId}
        otherUserName={targetName}
        otherUserImgId={targetImgId}
      />
    </>
  );
}

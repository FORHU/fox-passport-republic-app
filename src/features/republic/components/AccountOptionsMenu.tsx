"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  UserRound,
  UserMinus,
  Flag,
  Ban,
  ShieldCheck,
  Trash2,
  BellOff,
  Bell,
  Pin,
  PinOff,
} from "lucide-react";
import { toast } from "sonner";
import { useRemoveFollow } from "@/features/follow/api/useFollow";
import {
  useDeleteConversation,
  useSetConversationMuted,
  useSetConversationPinned,
} from "@/features/messages/hooks/useMessages";
import {
  useBlockStatus,
  useBlockUser,
  useUnblockUser,
} from "@/features/block/api/useBlock";
import { ReportModal } from "@/shared/components/ReportModal";

interface AccountOptionsMenuProps {
  targetId: string;
  /** Only present once a thread with this person exists — "Delete Chat"
   * doesn't show up for a follow you've never messaged. */
  conversationId?: string;
  isMuted?: boolean;
  isPinned?: boolean;
  /** Fires right after a successful delete, so the caller can also close
   * that person's chat window if it's currently open. */
  onChatDeleted?: () => void;
}

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

// A "more options" menu for an account you already follow — view profile,
// unfollow, delete chat (only once a thread exists), report, block.
// Messaging itself isn't here: clicking the row (see FollowingWidget) opens
// the composer instead, so it doesn't need a duplicate entry point.
export function AccountOptionsMenu({
  targetId,
  conversationId,
  isMuted,
  isPinned,
  onChatDeleted,
}: AccountOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: blockStatus } = useBlockStatus(targetId);
  const removeFollow = useRemoveFollow();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const deleteConversation = useDeleteConversation();
  const setMuted = useSetConversationMuted();
  const setPinned = useSetConversationPinned();

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
    removeFollow.isPending ||
    blockUser.isPending ||
    unblockUser.isPending ||
    deleteConversation.isPending;

  const handleReport = () => {
    setOpen(false);
    setShowReport(true);
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

  const handleDeleteChat = () => {
    if (!conversationId) return;
    setOpen(false);
    deleteConversation.mutate(conversationId, {
      onSuccess: () => onChatDeleted?.(),
      onError: (e) => toast.error(errorMessage(e, "Could not delete chat.")),
    });
  };

  const handleToggleMute = () => {
    if (!conversationId) return;
    setOpen(false);
    setMuted.mutate(
      { conversationId, muted: !isMuted },
      {
        onError: (e) =>
          toast.error(errorMessage(e, "Could not update notifications.")),
      },
    );
  };

  const handleTogglePin = () => {
    if (!conversationId) return;
    setOpen(false);
    setPinned.mutate(
      { conversationId, pinned: !isPinned },
      {
        onError: (e) =>
          toast.error(errorMessage(e, "Could not pin this chat.")),
      },
    );
  };

  const handleUnblock = () => {
    setOpen(false);
    unblockUser.mutate(targetId, {
      onError: (e) =>
        toast.error(errorMessage(e, "Could not unblock this citizen.")),
    });
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        aria-label="Account options"
        className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
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
            onClick={handleUnfollow}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Unfollow
          </button>
          {conversationId && (
            <>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={handleTogglePin}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                {isPinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
                {isPinned ? "Unpin Chat" : "Pin Chat"}
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={handleDeleteChat}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Chat
              </button>
            </>
          )}
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

      {showReport && (
        <ReportModal
          targetType="user"
          targetId={targetId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

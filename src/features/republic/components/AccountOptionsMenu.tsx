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
import { ReportModal } from "@/shared/components/ReportModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

interface AccountOptionsMenuProps {
  targetId: string;
  targetName?: string;
  conversationId?: string;
  isMuted?: boolean;
  isPinned?: boolean;
  isBlocked?: boolean;
  onUnfollow?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onToggleMute?: () => void;
  onTogglePin?: () => void;
  onDeleteChat?: () => void;
}

type PendingConfirm = "unfollow" | "block" | "deleteChat" | null;

export function AccountOptionsMenu({
  targetId,
  targetName,
  conversationId,
  isMuted,
  isPinned,
  isBlocked = false,
  onUnfollow,
  onBlock,
  onUnblock,
  onToggleMute,
  onTogglePin,
  onDeleteChat,
}: AccountOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = targetName || "this citizen";

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

  const handleReport = () => {
    setOpen(false);
    setShowReport(true);
  };

  const handleUnfollow = () => {
    setOpen(false);
    setPendingConfirm("unfollow");
  };

  const handleBlock = () => {
    setOpen(false);
    setPendingConfirm("block");
  };

  const handleDeleteChat = () => {
    if (!conversationId) return;
    setOpen(false);
    setPendingConfirm("deleteChat");
  };

  const confirmPending = () => {
    if (pendingConfirm === "unfollow") onUnfollow?.();
    else if (pendingConfirm === "block") onBlock?.();
    else if (pendingConfirm === "deleteChat") onDeleteChat?.();
    setPendingConfirm(null);
  };

  const handleToggleMute = () => {
    if (!conversationId) return;
    setOpen(false);
    onToggleMute?.();
  };

  const handleTogglePin = () => {
    if (!conversationId) return;
    setOpen(false);
    onTogglePin?.();
  };

  const handleUnblock = () => {
    setOpen(false);
    onUnblock?.();
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account options"
        className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
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

      {pendingConfirm && (
        <ConfirmModal
          title={
            pendingConfirm === "unfollow"
              ? "Unfollow?"
              : pendingConfirm === "block"
                ? "Block this citizen?"
                : "Delete this chat?"
          }
          description={
            pendingConfirm === "unfollow"
              ? `You'll stop following ${name}. You can follow them again anytime.`
              : pendingConfirm === "block"
                ? `${name} won't be able to message you or see your posts. You can unblock them anytime.`
                : "This removes the chat from your list. The other person keeps their side, and it comes back the next time either of you sends a message."
          }
          confirmLabel={
            pendingConfirm === "unfollow"
              ? "Unfollow"
              : pendingConfirm === "block"
                ? "Block"
                : "Delete"
          }
          onConfirm={confirmPending}
          onClose={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}

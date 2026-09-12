/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserMinus, X } from "lucide-react";
import type { ChatParticipant } from "../store/useChatWindowsStore";

interface GroupMembersModalProps {
  groupName: string;
  /** The other members — excludes the viewer, same shape as ChatWindowData. */
  participants: ChatParticipant[];
  currentUser: { id: string; name: string; imgId?: string | null };
  /** Only the group's creator can remove someone else — see
   * ConversationService.removeGroupMember. */
  isOwner: boolean;
  onRemove: (userId: string) => void;
  removingId?: string;
  onClose: () => void;
}

// A read-only roster, plus a Remove action per other member when the
// viewer is the group's creator — adding and leaving already live on the
// header buttons next to the entry point that opens this, so those aren't
// duplicated here.
export function GroupMembersModal({
  groupName,
  participants,
  currentUser,
  isOwner,
  onRemove,
  removingId,
  onClose,
}: GroupMembersModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  const members = [
    { ...currentUser, isMe: true },
    ...participants.map((p) => ({ ...p, isMe: false })),
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 sm:min-h-0 sm:max-h-[80vh] sm:w-full sm:max-w-sm sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">
              {groupName}
            </h2>
            <p className="text-[10px] text-zinc-500">
              {members.length} members
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="w-full flex items-center gap-3 p-2 rounded-xl"
            >
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-zinc-500">
                {m.imgId ? (
                  <img
                    src={m.imgId}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  m.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              <p className="flex-1 min-w-0 text-xs font-bold text-zinc-200 truncate">
                {m.name || "Unknown Citizen"}
                {m.isMe && (
                  <span className="ml-1.5 text-[10px] font-medium text-zinc-500">
                    (You)
                  </span>
                )}
              </p>
              {isOwner && !m.isMe && (
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  disabled={removingId === m.id}
                  aria-label={`Remove ${m.name}`}
                  title={`Remove ${m.name}`}
                  className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

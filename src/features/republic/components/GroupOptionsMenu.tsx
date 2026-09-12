"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, LogOut, Bell, BellOff, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import {
  useSetConversationMuted,
  useSetConversationPinned,
} from "@/features/messages/hooks/useMessages";

interface GroupOptionsMenuProps {
  conversationId: string;
  groupName: string;
  isMuted?: boolean;
  isPinned?: boolean;
  onLeave: () => void;
  isLeaving?: boolean;
}

const errorMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

// Same "..." dropdown shape as AccountOptionsMenu, scaled to what makes
// sense on a group row — mute/pin (personal, same as a 1:1 thread) plus
// leaving. A group has no profile to view, nothing to unfollow, and
// blocking/reporting a thread isn't a per-row action, so this doesn't try
// to mirror the rest of that menu's items.
export function GroupOptionsMenu({
  conversationId,
  groupName,
  isMuted,
  isPinned,
  onLeave,
  isLeaving,
}: GroupOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  const handleLeave = () => {
    setOpen(false);
    onLeave();
  };

  const handleTogglePin = () => {
    setOpen(false);
    setPinned.mutate(
      { conversationId, pinned: !isPinned },
      {
        onError: (e) =>
          toast.error(errorMessage(e, "Could not pin this chat.")),
      },
    );
  };

  const handleToggleMute = () => {
    setOpen(false);
    setMuted.mutate(
      { conversationId, muted: !isMuted },
      {
        onError: (e) =>
          toast.error(errorMessage(e, "Could not update notifications.")),
      },
    );
  };

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isLeaving}
        aria-label="Group options"
        className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20 py-1">
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
            onClick={handleLeave}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Leave &quot;{groupName}&quot;
          </button>
        </div>
      )}
    </div>
  );
}

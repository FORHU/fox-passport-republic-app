"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, LogOut, Bell, BellOff, Pin, PinOff } from "lucide-react";

export interface GroupOptionsMenuProps {
  conversationId: string;
  groupName: string;
  isMuted?: boolean;
  isPinned?: boolean;
  onLeave: () => void;
  isLeaving?: boolean;
  onToggleMute?: () => void;
  onTogglePin?: () => void;
}

export function GroupOptionsMenu({
  groupName,
  isMuted,
  isPinned,
  onLeave,
  isLeaving,
  onToggleMute,
  onTogglePin,
}: GroupOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    onTogglePin?.();
  };

  const handleToggleMute = () => {
    setOpen(false);
    onToggleMute?.();
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

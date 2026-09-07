"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Ban, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useBlockStatus, useBlockUser, useUnblockUser } from "../api/useBlock";

interface BlockMenuButtonProps {
  targetId: string;
  className?: string;
}

export function BlockMenuButton({
  targetId,
  className = "",
}: BlockMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: status } = useBlockStatus(targetId);
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

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

  const isBlocked = status?.blockedByMe ?? false;
  const isPending = blockUser.isPending || unblockUser.isPending;

  const errorMessage = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback;

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
    <div ref={menuRef} className={`relative shrink-0 ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-all disabled:opacity-50"
        aria-label="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-20">
          {isBlocked ? (
            <button
              onClick={handleUnblock}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Unblock Citizen
            </button>
          ) : (
            <button
              onClick={handleBlock}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Block Citizen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

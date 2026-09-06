"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowStatus, useToggleFollow } from "../api/useFollow";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetId: string;
  className?: string;
  compact?: boolean;
  /** Skips the initial GET /follows/:id/status round trip when the caller
   * already knows the answer (e.g. it came embedded in a feed response). */
  initialIsFollowing?: boolean;
}

export function FollowButton({ targetId, className = "", compact = false, initialIsFollowing }: FollowButtonProps) {
  const { user, openLogin } = useAuthStore();
  const { data: status, isLoading } = useFollowStatus(
    user ? targetId : undefined,
    initialIsFollowing,
  );
  const toggleFollow = useToggleFollow();

  const isSelf = user?.id === targetId;

  if (isSelf) return null;

  const isFollowing = status?.following ?? false;
  const isPending = toggleFollow.isPending;

  const handleToggle = () => {
    if (!user) {
      openLogin();
      return;
    }

    toggleFollow.mutate(targetId, {
      onError: () => toast.error("Failed to update follow status"),
    });
  };

  const defaultClasses = compact 
    ? "h-8 px-3 rounded-lg text-xs" 
    : "h-9 px-4 rounded-xl text-sm";

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isPending}
      className={`font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${defaultClasses} ${
        isFollowing
          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500"
          : "bg-lime-400 text-black hover:bg-lime-300 shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
      } ${className}`}
    >
      {(isLoading || isPending) ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {!compact && (isFollowing ? "Following" : "Follow")}
    </button>
  );
}

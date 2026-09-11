"use client";

import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowStatus, useSendFollow, useRemoveFollow } from "../api/useFollow";
import { useBlockStatus } from "@/features/block/api/useBlock";
import { Loader2, UserPlus, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetId: string;
  className?: string;
  compact?: boolean;
  /** Skips the initial GET /follows/:id/status round trip when the caller
   * already knows the answer (e.g. it came embedded in a feed response). */
  initialIsFollowing?: boolean;
}

export function FollowButton({
  targetId,
  className = "",
  compact = false,
  initialIsFollowing,
}: FollowButtonProps) {
  const { user, openLogin } = useAuthStore();
  const { data: status, isLoading } = useFollowStatus(
    user ? targetId : undefined,
    initialIsFollowing,
  );
  const { data: blockStatus } = useBlockStatus(user ? targetId : undefined);
  const sendFollow = useSendFollow();
  const removeFollow = useRemoveFollow();

  const isSelf = user?.id === targetId;

  if (isSelf) return null;
  if (blockStatus?.blockedByMe || blockStatus?.blockedMe) return null;

  const relation = status?.status ?? "none";
  // Not tied to `relation` display: the mutations set `followStatus`
  // optimistically in `onMutate`, so the label/icon below already reflects
  // the new state the instant a click happens — this only guards against a
  // double-click firing a second request before the first settles.
  const isMutating = sendFollow.isPending || removeFollow.isPending;

  const errorMessage = (e: unknown, fallback: string) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback;

  const handleClick = () => {
    if (!user) {
      openLogin();
      return;
    }

    if (relation === "none") {
      sendFollow.mutate(targetId, {
        onError: (e) =>
          toast.error(errorMessage(e, "Failed to send follow request")),
      });
    } else {
      // Covers both "unfollow" (accepted) and "cancel request" (pending).
      removeFollow.mutate(targetId, {
        onError: (e) =>
          toast.error(errorMessage(e, "Failed to update follow status")),
      });
    }
  };

  const defaultClasses = compact
    ? "h-8 px-3 rounded-lg text-xs"
    : "h-9 px-4 rounded-xl text-sm";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isMutating}
      className={`font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${defaultClasses} ${
        relation === "accepted"
          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500"
          : relation === "pending"
            ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
            : "bg-lime-400 text-black hover:bg-lime-300 shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : relation === "accepted" ? (
        <UserCheck className="w-4 h-4" />
      ) : relation === "pending" ? (
        <Clock className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {!compact &&
        (relation === "accepted"
          ? "Following"
          : relation === "pending"
            ? "Requested"
            : "Follow")}
    </button>
  );
}

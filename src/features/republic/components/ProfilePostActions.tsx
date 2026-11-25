"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { ReactionType } from "@/shared/types/feed";
import { setPostReaction } from "@/shared/api/feed";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { signInThen } from "@/shared/auth/returnTo";
import { usePostStats, usePostStatsStore } from "../store/usePostStatsStore";
import { ReactionButton } from "./ReactionButton";
import { CommentSection } from "./CommentSection";
import { ActionCount } from "./ActionCount";

/** The counts a profile's post list carries (GET /users/profile/:id). */
export interface ProfilePostCounts {
  id: string;
  likesCount: number;
  commentsCount: number;
  myReaction?: ReactionType | null;
  isLikedByMe?: boolean;
  // Seeded into the shared store too, so a feed card opened later doesn't
  // start these at 0.
  sharesCount?: number;
  sendsCount?: number;
  repostsCount?: number;
  viewsCount?: number;
}

interface ProfilePostActionsProps {
  post: ProfilePostCounts;
  /** When the request that returned `post` started (ms). With it, a refetch
   * updates counts already held (as the feed does); without it, the post
   * only seeds them. */
  requestedAt?: number;
  /** Shown at the end of the action row (e.g. "View in Feed"). */
  children?: React.ReactNode;
}

/**
 * React and comment on a post from a profile's Republic Activity (api#427),
 * without leaving the profile. Comments, replies and comment reactions open
 * inside the card. Counts live in the same store as the feed's cards, so
 * both show the same numbers.
 */
export function ProfilePostActions({
  post,
  requestedAt,
  children,
}: ProfilePostActionsProps) {
  const { user } = useAuthStore();
  const { myReaction, likesCount, commentsCount } = usePostStats(post);
  const adjustComments = usePostStatsStore((s) => s.adjustComments);
  const [showComments, setShowComments] = useState(false);

  // A refetched profile brings fresher counts (e.g. a followers-only post,
  // which gets no live events); syncFromServer takes them unless the viewer
  // reacted after that request started.
  useEffect(() => {
    const store = usePostStatsStore.getState();
    if (requestedAt === undefined) store.seed(post);
    else store.syncFromServer([post], requestedAt);
  }, [post, requestedAt]);

  // Same flow as PostCard: optimistic, then the server's answer wins.
  const handleReact = async (type: ReactionType | null) => {
    if (!user) {
      signInThen(window.location.pathname + window.location.search);
      return;
    }
    const stats = usePostStatsStore.getState();
    stats.seed(post);
    stats.beginReaction(post.id);
    const prev = stats.react(post.id, type);
    try {
      const res = await setPostReaction(post.id, type);
      stats.setReaction(post.id, res);
    } catch (err) {
      if (prev) stats.restore(post.id, prev);
      console.error("Reaction failed:", err);
    } finally {
      stats.endReaction(post.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div>
            <ReactionButton
              myReaction={myReaction}
              likesCount={likesCount}
              onReact={handleReact}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowComments((open) => !open)}
            aria-expanded={showComments}
            aria-label={showComments ? "Hide comments" : "Show comments"}
            className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <ActionCount n={commentsCount} />
          </button>
        </div>
        {children}
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          commentsCount={commentsCount}
          onCommentAdded={() => adjustComments(post.id, 1)}
          onCommentDeleted={(removed) => adjustComments(post.id, -removed)}
        />
      )}
    </div>
  );
}

/** A post's live like or comment count, for places that only show numbers
 * (the profile's media tiles), so they follow reactions made elsewhere. */
export function LivePostCount({
  post,
  kind,
}: {
  post: ProfilePostCounts;
  kind: "likes" | "comments";
}) {
  const { likesCount, commentsCount } = usePostStats(post);
  return <>{kind === "likes" ? likesCount : commentsCount}</>;
}

import { create } from "zustand";
import type { FeedPost, ReactionType } from "../types";
import { onAccountChange } from "@/shared/auth/useAuthStore";

export interface PostStats {
  likesCount: number;
  commentsCount: number;
  myReaction: ReactionType | null;
}

type PostCounts = Pick<
  FeedPost,
  "id" | "likesCount" | "commentsCount" | "myReaction" | "isLikedByMe"
>;

interface PostStatsState {
  stats: Record<string, PostStats>;
  /** Reaction requests still in flight, per post. */
  pending: Record<string, number>;
  /** When each post was last changed here (a reaction or comment), in ms. */
  touchedAt: Record<string, number>;
  /** Sets a post's counts only if it has none yet. Used when a card mounts:
   * the detail modal is built from the card's original post object, so its
   * copy may be older than what the store already holds. */
  seed: (post: PostCounts) => void;
  /** Overwrites counts with server data from a request started at
   * `requestedAt`. Skips posts with a reaction in flight, or changed here
   * since that request started, so an older response can't undo them. */
  syncFromServer: (posts: PostCounts[], requestedAt: number) => void;
  /** Optimistic reaction change. Returns the previous stats for rollback. */
  react: (postId: string, next: ReactionType | null) => PostStats | undefined;
  setReaction: (
    postId: string,
    res: { reaction: ReactionType | null; likesCount: number },
  ) => void;
  restore: (postId: string, prev: PostStats) => void;
  beginReaction: (postId: string) => void;
  endReaction: (postId: string) => void;
  adjustComments: (postId: string, delta: number) => void;
  reset: () => void;
}

export const statsFromPost = (post: PostCounts): PostStats => ({
  likesCount: post.likesCount,
  commentsCount: post.commentsCount,
  myReaction: post.myReaction ?? (post.isLikedByMe ? "like" : null),
});

const patch = (
  stats: Record<string, PostStats>,
  postId: string,
  change: Partial<PostStats>,
) => {
  const current = stats[postId];
  if (!current) return stats;
  return { ...stats, [postId]: { ...current, ...change } };
};

// One copy of each post's like and comment counts, shared by every PostCard
// showing that post (the feed card, the detail modal over it, saved posts),
// so a like or comment in one shows in all of them at once (BUG-25).
export const usePostStatsStore = create<PostStatsState>((set, get) => ({
  stats: {},
  pending: {},
  touchedAt: {},

  seed: (post) => {
    if (get().stats[post.id]) return;
    set((s) => ({ stats: { ...s.stats, [post.id]: statsFromPost(post) } }));
  },

  syncFromServer: (posts, requestedAt) =>
    set((s) => {
      const stats = { ...s.stats };
      for (const post of posts) {
        if (s.pending[post.id]) continue;
        if ((s.touchedAt[post.id] ?? -Infinity) >= requestedAt) continue;
        stats[post.id] = statsFromPost(post);
      }
      return { stats };
    }),

  react: (postId, next) => {
    const prev = get().stats[postId];
    if (!prev) return undefined;
    let likesCount = prev.likesCount;
    if (prev.myReaction && !next) likesCount = Math.max(0, likesCount - 1);
    else if (!prev.myReaction && next) likesCount += 1;
    set((s) => ({
      stats: patch(s.stats, postId, { myReaction: next, likesCount }),
    }));
    return prev;
  },

  setReaction: (postId, res) =>
    set((s) => ({
      stats: patch(s.stats, postId, {
        myReaction: res.reaction,
        likesCount: res.likesCount,
      }),
    })),

  restore: (postId, prev) =>
    set((s) => ({ stats: patch(s.stats, postId, prev) })),

  beginReaction: (postId) =>
    set((s) => ({
      pending: { ...s.pending, [postId]: (s.pending[postId] ?? 0) + 1 },
      touchedAt: { ...s.touchedAt, [postId]: Date.now() },
    })),

  // Touched again on settle: a fetch started while the reaction was in
  // flight may have read the post before the reaction was saved.
  endReaction: (postId) =>
    set((s) => {
      const left = (s.pending[postId] ?? 1) - 1;
      const pending = { ...s.pending };
      if (left > 0) pending[postId] = left;
      else delete pending[postId];
      return {
        pending,
        touchedAt: { ...s.touchedAt, [postId]: Date.now() },
      };
    }),

  adjustComments: (postId, delta) =>
    set((s) => {
      const current = s.stats[postId];
      if (!current) return s;
      return {
        stats: patch(s.stats, postId, {
          commentsCount: Math.max(0, current.commentsCount + delta),
        }),
        touchedAt: { ...s.touchedAt, [postId]: Date.now() },
      };
    }),

  reset: () => set({ stats: {}, pending: {}, touchedAt: {} }),
}));

/** The post's shared counts, or the post's own values until it is seeded. */
export function usePostStats(post: PostCounts): PostStats {
  const entry = usePostStatsStore((s) => s.stats[post.id]);
  return entry ?? statsFromPost(post);
}

// `myReaction` belongs to one viewer: drop everything when the account changes.
onAccountChange(() => usePostStatsStore.getState().reset());

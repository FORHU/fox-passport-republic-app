import api from "@/shared/lib/axios";
import {
  FeedPost,
  FeedTab,
  PostType,
  PostComment,
  CreatePostPayload,
  PostVisibility,
  ReactionType,
  ReactionBreakdownEntry,
  MentionCandidate,
  MediaTag,
  Poll,
} from "@/shared/types/feed";

export interface FeedResponse {
  success: boolean;
  data: FeedPost[];
  /** Opaque: pass back as `cursor` for the next page, never parse it. */
  nextCursor?: string | null;
  /** For you only: the session's start (server time). Newer posts aren't in it. */
  anchor?: string;
}

/** `foryou` is the ranked mix (app#308); `recent` is strictly newest first. */
export type FeedMode = "foryou" | "recent";

export const getFeed = async (params: {
  tab?: FeedTab;
  type?: PostType;
  search?: string;
  limit?: number;
  cursor?: string;
  mode?: FeedMode;
}): Promise<FeedResponse> => {
  const queryParams = { ...params };
  if (queryParams.tab === "all") {
    delete queryParams.tab;
  }
  const res = await api.get("/feed", { params: queryParams });
  return res.data;
};

/**
 * How many posts the viewer may see were created after `since`, not counting
 * their own. Drives the "New posts" pill.
 */
export const getNewPostsCount = async (params: {
  since: string;
  tab?: FeedTab;
}): Promise<number> => {
  const res = await api.get("/feed/new-count", {
    params: {
      since: params.since,
      ...(params.tab && params.tab !== "all" ? { tab: params.tab } : {}),
    },
  });
  return res.data?.data?.count ?? 0;
};

export const getPostById = async (id: string): Promise<FeedPost> => {
  const res = await api.get(`/feed/${id}`);
  return res.data.data;
};

export const createPost = async (
  payload: CreatePostPayload,
): Promise<FeedPost> => {
  const res = await api.post("/feed", payload);
  return res.data.data;
};

export const deletePost = async (id: string): Promise<{ success: boolean }> => {
  const res = await api.delete(`/feed/${id}`);
  return res.data;
};

export const setPostReaction = async (
  id: string,
  type: ReactionType | null,
): Promise<{ reaction: ReactionType | null; likesCount: number }> => {
  const res = await api.post(`/feed/${id}/reaction`, { type });
  return res.data.data;
};

export const getReactionBreakdown = async (
  id: string,
): Promise<ReactionBreakdownEntry[]> => {
  const res = await api.get(`/feed/${id}/reactions`);
  return res.data.data;
};

export const editPost = async (
  id: string,
  payload: {
    content?: string;
    mediaUrls?: string[];
    visibility?: PostVisibility;
  },
): Promise<FeedPost> => {
  const res = await api.patch(`/feed/${id}`, payload);
  return res.data.data;
};

export const repostPost = async (
  id: string,
  caption: string,
): Promise<FeedPost> => {
  const res = await api.post(`/feed/${id}/repost`, { caption });
  return res.data.data;
};

/** Counts a share once per signed-in user per post (the API enforces it).
 * `counted` is false for a repeat or a guest; `sharesCount` is the post's
 * count either way. */
export const trackPostShare = async (
  id: string,
): Promise<{ counted: boolean; sharesCount: number }> => {
  const res = await api.post(`/feed/${id}/share`);
  return res.data.data;
};

/** Records that the signed-in viewer saw these posts. Returns the ids the
 * server counted (first view by a non-author who may see the post). */
export const recordPostViews = async (postIds: string[]): Promise<string[]> => {
  const res = await api.post(`/feed/views`, { postIds });
  return res.data.data?.recorded ?? [];
};

export const toggleSavePost = async (
  id: string,
): Promise<{ saved: boolean }> => {
  const res = await api.post(`/feed/${id}/save`);
  return res.data.data;
};

export const getSavedPosts = async (params?: {
  limit?: number;
  cursor?: string;
}): Promise<FeedResponse> => {
  const res = await api.get("/feed/saved", { params });
  return res.data;
};

export const voteOnPoll = async (
  postId: string,
  optionId: string,
): Promise<Poll> => {
  const res = await api.post(`/feed/${postId}/poll/vote`, { optionId });
  return res.data.data;
};

export const hidePost = async (id: string): Promise<void> => {
  await api.post(`/feed/${id}/hide`);
};

export const searchMentionCandidates = async (
  query: string,
): Promise<MentionCandidate[]> => {
  const res = await api.get("/feed/mentions/search", { params: { q: query } });
  return res.data.data;
};

export const getPostComments = async (
  id: string,
  params?: { limit?: number; cursor?: string },
): Promise<PostComment[]> => {
  const res = await api.get(`/feed/${id}/comments`, { params });
  return res.data.data;
};

export const addPostComment = async (
  id: string,
  content: string,
  parentId?: string,
): Promise<PostComment> => {
  const res = await api.post(`/feed/${id}/comments`, { content, parentId });
  return res.data.data;
};

export const editPostComment = async (
  postId: string,
  commentId: string,
  content: string,
): Promise<PostComment> => {
  const res = await api.patch(`/feed/${postId}/comments/${commentId}`, {
    content,
  });
  return res.data.data;
};

export const deletePostComment = async (
  postId: string,
  commentId: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/feed/${postId}/comments/${commentId}`);
  return res.data;
};

/** Sets, swaps or (with null) removes the viewer's reaction on a comment —
 * the same six reactions as a post (api#427). */
export const setCommentReaction = async (
  postId: string,
  commentId: string,
  type: ReactionType | null,
): Promise<{ reaction: ReactionType | null; likesCount: number }> => {
  const res = await api.post(
    `/feed/${postId}/comments/${commentId}/reaction`,
    { type },
  );
  return res.data.data;
};

export const addMediaTag = async (
  postId: string,
  payload: { mediaUrl: string; userId: string; x: number; y: number },
): Promise<MediaTag> => {
  const res = await api.post(`/feed/${postId}/media-tags`, payload);
  return res.data.data;
};

export const removeMediaTag = async (
  postId: string,
  tagId: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/feed/${postId}/media-tags/${tagId}`);
  return res.data;
};

export const fileReport = async (payload: {
  targetType: "post" | "user" | "venue";
  targetId: string;
  reason: string;
  details?: string;
}): Promise<void> => {
  await api.post("/reports", payload);
};

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
} from "@/shared/types/feed";

export interface FeedResponse {
  success: boolean;
  data: FeedPost[];
  nextCursor?: string | null;
}

export const getFeed = async (params: {
  tab?: FeedTab;
  type?: PostType;
  search?: string;
  limit?: number;
  cursor?: string;
  mode?: "recent" | "top";
}): Promise<FeedResponse> => {
  const queryParams = { ...params };
  if (queryParams.tab === "all") {
    delete queryParams.tab;
  }
  const res = await api.get("/feed", { params: queryParams });
  return res.data;
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

export const toggleSavePost = async (
  id: string,
): Promise<{ saved: boolean }> => {
  const res = await api.post(`/feed/${id}/save`);
  return res.data.data;
};

export const getSavedPosts = async (params?: {
  limit?: number;
  cursor?: string;
}): Promise<FeedPost[]> => {
  const res = await api.get("/feed/saved", { params });
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

export const deletePostComment = async (
  postId: string,
  commentId: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/feed/${postId}/comments/${commentId}`);
  return res.data;
};

export const toggleCommentLike = async (
  postId: string,
  commentId: string,
): Promise<{ liked: boolean; likesCount: number }> => {
  const res = await api.post(`/feed/${postId}/comments/${commentId}/like`);
  return res.data.data;
};

export const fileReport = async (payload: {
  targetType: "post" | "user";
  targetId: string;
  reason: string;
  details?: string;
}): Promise<void> => {
  await api.post("/reports", payload);
};

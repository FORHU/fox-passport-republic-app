import api from "@/shared/lib/axios";
import {
  FeedPost,
  FeedTab,
  PostType,
  PostComment,
  CreatePostPayload,
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

export const toggleLikePost = async (
  id: string,
): Promise<{ liked: boolean; likesCount: number }> => {
  const res = await api.post(`/feed/${id}/like`);
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
): Promise<PostComment> => {
  const res = await api.post(`/feed/${id}/comments`, { content });
  return res.data.data;
};

export const deletePostComment = async (
  postId: string,
  commentId: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/feed/${postId}/comments/${commentId}`);
  return res.data;
};

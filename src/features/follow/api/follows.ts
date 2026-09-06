import api from "@/shared/lib/axios";

export async function toggleFollow(targetId: string): Promise<{ following: boolean }> {
  const resp = await api.post("/follows", { targetId });
  return resp.data.data;
}

export async function getFollowStatus(targetId: string): Promise<{ following: boolean }> {
  const resp = await api.get(`/follows/${targetId}/status`);
  return resp.data.data;
}

export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const resp = await api.get(`/follows/${userId}/counts`);
  return resp.data.data;
}

export interface FollowListUser {
  id: string;
  name: string;
  username: string | null;
  imgId: string | null;
}

export interface FollowListPage {
  data: FollowListUser[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20,
): Promise<FollowListPage> {
  const resp = await api.get(`/follows/${userId}/followers`, {
    params: { page, limit },
  });
  return resp.data.data;
}

export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20,
): Promise<FollowListPage> {
  const resp = await api.get(`/follows/${userId}/following`, {
    params: { page, limit },
  });
  return resp.data.data;
}

export async function getFollowSuggestions(): Promise<any[]> {
  const resp = await api.get("/follows/suggestions");
  return resp.data.data;
}

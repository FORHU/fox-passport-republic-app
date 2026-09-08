import api from "@/shared/lib/axios";

export type FollowRelationStatus = "none" | "pending" | "accepted";

export interface FollowStatusResult {
  status: FollowRelationStatus;
  direction: "incoming" | "outgoing" | null;
}

export async function sendFollowRequest(
  targetId: string,
): Promise<{ status: FollowRelationStatus }> {
  const resp = await api.post("/follows", { targetId });
  return resp.data.data;
}

export async function removeFollow(
  targetId: string,
): Promise<{ status: "none" }> {
  const resp = await api.delete(`/follows/${targetId}`);
  return resp.data.data;
}

export async function acceptFollowRequest(
  requesterId: string,
): Promise<{ status: "accepted" }> {
  const resp = await api.post(`/follows/${requesterId}/accept`);
  return resp.data.data;
}

export async function declineFollowRequest(
  requesterId: string,
): Promise<{ status: "none" }> {
  const resp = await api.post(`/follows/${requesterId}/decline`);
  return resp.data.data;
}

export async function getFollowStatus(
  targetId: string,
): Promise<FollowStatusResult> {
  const resp = await api.get(`/follows/${targetId}/status`);
  return resp.data.data;
}

export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
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

export async function getFollowRequests(
  page = 1,
  limit = 20,
): Promise<FollowListPage> {
  const resp = await api.get("/follows/requests", { params: { page, limit } });
  return resp.data.data;
}

export async function getFollowSuggestions(): Promise<FollowListUser[]> {
  const resp = await api.get("/follows/suggestions");
  return resp.data.data;
}

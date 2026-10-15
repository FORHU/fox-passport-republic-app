import api from "@/shared/lib/axios";

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
}

export async function blockUser(targetId: string): Promise<{ blocked: true }> {
  const resp = await api.post("/blocks", { targetId });
  return resp.data.data;
}

export async function unblockUser(
  targetId: string,
): Promise<{ blocked: false }> {
  const resp = await api.delete(`/blocks/${targetId}`);
  return resp.data.data;
}

export async function getBlockStatus(targetId: string): Promise<BlockStatus> {
  const resp = await api.get(`/blocks/${targetId}/status`);
  return resp.data.data;
}

export interface BlockedUser {
  id: string;
  name: string;
  username: string | null;
  imgId: string | null;
}

export interface BlockedUsersPage {
  data: BlockedUser[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getBlockedUsers(
  page = 1,
  limit = 20,
): Promise<BlockedUsersPage> {
  const resp = await api.get("/blocks", { params: { page, limit } });
  return resp.data.data;
}

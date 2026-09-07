import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blockUser,
  unblockUser,
  getBlockStatus,
  getBlockedUsers,
} from "./blocks";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export function useBlockStatus(targetId?: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["blockStatus", targetId],
    queryFn: () => getBlockStatus(targetId!),
    enabled: !!targetId && !!user,
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => blockUser(targetId),
    onSuccess: (_, targetId) => {
      queryClient.invalidateQueries({ queryKey: ["blockStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", targetId] });
    },
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => unblockUser(targetId),
    onSuccess: (_, targetId) => {
      queryClient.invalidateQueries({ queryKey: ["blockStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useBlockedUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["blockedUsers", page, limit],
    queryFn: () => getBlockedUsers(page, limit),
  });
}

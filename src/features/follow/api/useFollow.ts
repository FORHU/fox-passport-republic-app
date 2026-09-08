import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendFollowRequest,
  removeFollow,
  acceptFollowRequest,
  declineFollowRequest,
  getFollowStatus,
  getFollowCounts,
  getFollowRequests,
  getFollowSuggestions,
  getFollowing,
  type FollowStatusResult,
} from "./follows";
import { useAuthStore } from "@/shared/auth/useAuthStore";

// `initialIsFollowing` lets a caller that already knows the answer (e.g. the
// feed response embeds `isFollowingAuthor` per post) skip the network round
// trip entirely instead of firing one GET per distinct author on the page.
// It only ever signals the accepted case — a falsy value falls through to a
// real fetch, which is the only way to resolve "pending" or "none".
export function useFollowStatus(
  targetId?: string,
  initialIsFollowing?: boolean,
) {
  return useQuery<FollowStatusResult>({
    queryKey: ["followStatus", targetId],
    queryFn: () => getFollowStatus(targetId!),
    enabled: !!targetId,
    ...(initialIsFollowing
      ? {
          initialData: { status: "accepted", direction: null },
          staleTime: 60 * 1000,
        }
      : {}),
  });
}

export function useFollowCounts(userId?: string) {
  return useQuery({
    queryKey: ["followCounts", userId],
    queryFn: () => getFollowCounts(userId!),
    enabled: !!userId,
  });
}

function useInvalidateFollow() {
  const queryClient = useQueryClient();
  return (targetId: string) => {
    queryClient.invalidateQueries({ queryKey: ["followStatus", targetId] });
    queryClient.invalidateQueries({ queryKey: ["followCounts", targetId] });
    queryClient.invalidateQueries({ queryKey: ["followCounts"] });
    queryClient.invalidateQueries({ queryKey: ["followList"] });
    queryClient.invalidateQueries({ queryKey: ["followRequests"] });
  };
}

export function useSendFollow() {
  const invalidate = useInvalidateFollow();
  return useMutation({
    mutationFn: (targetId: string) => sendFollowRequest(targetId),
    onSuccess: (_, targetId) => invalidate(targetId),
  });
}

export function useRemoveFollow() {
  const invalidate = useInvalidateFollow();
  return useMutation({
    mutationFn: (targetId: string) => removeFollow(targetId),
    onSuccess: (_, targetId) => invalidate(targetId),
  });
}

export function useFollowRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["followRequests", page, limit],
    queryFn: () => getFollowRequests(page, limit),
  });
}

export function useAcceptFollowRequest() {
  const invalidate = useInvalidateFollow();
  return useMutation({
    mutationFn: (requesterId: string) => acceptFollowRequest(requesterId),
    onSuccess: (_, requesterId) => invalidate(requesterId),
  });
}

export function useDeclineFollowRequest() {
  const invalidate = useInvalidateFollow();
  return useMutation({
    mutationFn: (requesterId: string) => declineFollowRequest(requesterId),
    onSuccess: (_, requesterId) => invalidate(requesterId),
  });
}

export function useFollowing(userId?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["followList", "following", userId, page, limit],
    queryFn: () => getFollowing(userId!, page, limit),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useFollowSuggestions() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["followSuggestions"],
    queryFn: () => getFollowSuggestions(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

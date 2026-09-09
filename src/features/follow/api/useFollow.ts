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

// Handles everything *other* than `followStatus`, which each mutation below
// manages itself (optimistic set on click, corrected on success/error) —
// invalidating it here too would just race that with a redundant refetch.
function useInvalidateFollowRelated() {
  const queryClient = useQueryClient();
  return (targetId: string) => {
    queryClient.invalidateQueries({ queryKey: ["followCounts", targetId] });
    queryClient.invalidateQueries({ queryKey: ["followCounts"] });
    queryClient.invalidateQueries({ queryKey: ["followList"] });
    queryClient.invalidateQueries({ queryKey: ["followRequests"] });
  };
}

export function useSendFollow() {
  const queryClient = useQueryClient();
  const invalidateRelated = useInvalidateFollowRelated();

  return useMutation({
    mutationFn: (targetId: string) => sendFollowRequest(targetId),
    onMutate: async (targetId: string) => {
      await queryClient.cancelQueries({ queryKey: ["followStatus", targetId] });
      const previous = queryClient.getQueryData<FollowStatusResult>([
        "followStatus",
        targetId,
      ]);
      // We don't know client-side whether the target is private (that's a
      // server-side decision in `sendFollow`), so "pending" is the honest
      // optimistic guess — it never overclaims a follow that isn't real yet.
      // `onSuccess` corrects it to "accepted" immediately once the response
      // is in, which for a public target is typically imperceptible.
      queryClient.setQueryData<FollowStatusResult>(["followStatus", targetId], {
        status: "pending",
        direction: "outgoing",
      });
      return { previous };
    },
    onError: (_err, targetId, context) => {
      queryClient.setQueryData(["followStatus", targetId], context?.previous);
    },
    onSuccess: (data, targetId) => {
      queryClient.setQueryData<FollowStatusResult>(["followStatus", targetId], {
        status: data.status,
        direction: "outgoing",
      });
      invalidateRelated(targetId);
    },
  });
}

export function useRemoveFollow() {
  const queryClient = useQueryClient();
  const invalidateRelated = useInvalidateFollowRelated();

  return useMutation({
    mutationFn: (targetId: string) => removeFollow(targetId),
    onMutate: async (targetId: string) => {
      await queryClient.cancelQueries({ queryKey: ["followStatus", targetId] });
      const previous = queryClient.getQueryData<FollowStatusResult>([
        "followStatus",
        targetId,
      ]);
      queryClient.setQueryData<FollowStatusResult>(["followStatus", targetId], {
        status: "none",
        direction: null,
      });
      return { previous };
    },
    onError: (_err, targetId, context) => {
      queryClient.setQueryData(["followStatus", targetId], context?.previous);
    },
    onSuccess: (_data, targetId) => {
      invalidateRelated(targetId);
    },
  });
}

export function useFollowRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["followRequests", page, limit],
    queryFn: () => getFollowRequests(page, limit),
  });
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient();
  const invalidateRelated = useInvalidateFollowRelated();
  return useMutation({
    mutationFn: (requesterId: string) => acceptFollowRequest(requesterId),
    onSuccess: (_, requesterId) => {
      queryClient.invalidateQueries({
        queryKey: ["followStatus", requesterId],
      });
      invalidateRelated(requesterId);
    },
  });
}

export function useDeclineFollowRequest() {
  const queryClient = useQueryClient();
  const invalidateRelated = useInvalidateFollowRelated();
  return useMutation({
    mutationFn: (requesterId: string) => declineFollowRequest(requesterId),
    onSuccess: (_, requesterId) => {
      queryClient.invalidateQueries({
        queryKey: ["followStatus", requesterId],
      });
      invalidateRelated(requesterId);
    },
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

export function useFollowSuggestions(page = 1, limit = 10) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["followSuggestions", page, limit],
    queryFn: () => getFollowSuggestions(page, limit),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow, getFollowStatus, getFollowCounts, getFollowSuggestions } from "./follows";
import { useAuthStore } from "@/shared/auth/useAuthStore";

// `initialIsFollowing` lets a caller that already knows the answer (e.g. the
// feed response embeds `isFollowingAuthor` per post) skip the network round
// trip entirely instead of firing one GET per distinct author on the page.
export function useFollowStatus(targetId?: string, initialIsFollowing?: boolean) {
  return useQuery({
    queryKey: ["followStatus", targetId],
    queryFn: () => getFollowStatus(targetId!),
    enabled: !!targetId,
    ...(initialIsFollowing !== undefined
      ? { initialData: { following: initialIsFollowing }, staleTime: 60 * 1000 }
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

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => toggleFollow(targetId),
    onSuccess: (_, targetId) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", targetId] });
      queryClient.invalidateQueries({ queryKey: ["followCounts", targetId] });
      // Invalidate the current user's follow counts as well if needed
      // (Requires knowing the current user ID, but can be done generally)
      queryClient.invalidateQueries({ queryKey: ["followCounts"] });
    },
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

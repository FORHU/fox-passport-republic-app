import { useQuery } from "@tanstack/react-query";
import {
  getMyAchievements,
  type UserAchievementsResponse,
} from "@/shared/api/achievements";

export function useAchievements() {
  return useQuery<UserAchievementsResponse>({
    queryKey: ["achievements", "me"],
    queryFn: getMyAchievements,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}


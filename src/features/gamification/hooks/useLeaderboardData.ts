import { useQuery } from "@tanstack/react-query";
import {
  getFoxerLeaderboard,
  type FoxerLeaderboardTab,
  type FoxerLeaderboardResponse,
} from "@/shared/api/leaderboard";

export function useFoxerLeaderboard(
  tab: FoxerLeaderboardTab = "top_rated",
  role?: string,
  city?: string,
) {
  return useQuery<FoxerLeaderboardResponse>({
    queryKey: ["leaderboard", "foxers", tab, role || "all", city || "global"],
    queryFn: () => getFoxerLeaderboard(tab, role, city),
    staleTime: 1000 * 60 * 3,
  });
}

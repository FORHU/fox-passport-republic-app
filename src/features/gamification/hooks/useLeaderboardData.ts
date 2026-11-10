import { useQuery } from "@tanstack/react-query";
import {
  getCitizenLeaderboard,
  getFoxerLeaderboard,
  type CitizenLeaderboardTab,
  type FoxerLeaderboardTab,
  type CitizenLeaderboardResponse,
  type FoxerLeaderboardResponse,
} from "@/shared/api/leaderboard";

export function useCitizenLeaderboard(
  tab: CitizenLeaderboardTab = "this_month",
  city?: string,
) {
  return useQuery<CitizenLeaderboardResponse>({
    queryKey: ["leaderboard", "citizens", tab, city || "global"],
    queryFn: () => getCitizenLeaderboard(tab, city),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });
}

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

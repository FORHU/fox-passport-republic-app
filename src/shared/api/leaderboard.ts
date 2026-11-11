import api from "../lib/axios";

export type FoxerLeaderboardTab = "top_rated" | "most_booked" | "rising";

export interface FoxerLeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  city: string | null;
  starRating: number;
  reviewCount: number;
  completedBookings: number;
}

export interface FoxerLeaderboardResponse {
  entries: FoxerLeaderboardEntry[];
  userPosition: FoxerLeaderboardEntry | null;
  tab: FoxerLeaderboardTab;
  role?: string;
  city?: string;
}

export async function getFoxerLeaderboard(
  tab: FoxerLeaderboardTab = "top_rated",
  role?: string,
  city?: string,
): Promise<FoxerLeaderboardResponse> {
  const params: Record<string, string> = { tab };
  if (role) params.role = role;
  if (city) params.city = city;
  const res = await api.get("/leaderboard/foxers", { params });
  return (
    res.data?.data ?? {
      entries: [],
      userPosition: null,
      tab,
    }
  );
}

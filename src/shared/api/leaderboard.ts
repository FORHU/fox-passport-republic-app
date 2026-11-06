import api from "../lib/axios";

export type CitizenLeaderboardTab = "this_month" | "all_time" | "my_city";

export interface CitizenLeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  level: number;
  rankTitle: string;
  city: string | null;
}

export interface CitizenLeaderboardResponse {
  entries: CitizenLeaderboardEntry[];
  userPosition: CitizenLeaderboardEntry | null;
  tab: CitizenLeaderboardTab;
  season: string;
}

export type FoxerLeaderboardTab = "top_rated" | "most_booked" | "rising";

export interface FoxerLeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  city: string | null;
  rankTitle: string;
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

export async function getCitizenLeaderboard(
  tab: CitizenLeaderboardTab = "this_month",
  city?: string,
): Promise<CitizenLeaderboardResponse> {
  const params: Record<string, string> = { tab };
  if (city) params.city = city;
  const res = await api.get("/leaderboard/citizens", { params });
  return (
    res.data?.data ?? {
      entries: [],
      userPosition: null,
      tab,
      season: "",
    }
  );
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

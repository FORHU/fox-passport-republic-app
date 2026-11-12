import api from "../lib/axios";

export type FoxerLeaderboardTab = "top_rated" | "most_booked" | "rising";

export interface FoxerLeaderboardEntry {
  position: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  city: string | null;
  /** The star rating drawn as paws, one decimal; null under 5 reviews ("New"). */
  paws?: number | null;
  starRating: number;
  reviewCount: number;
  completedBookings: number;
  /** Role approval date, else sign-up (ISO). */
  foxerSince?: string;
  /** Identity check approved. */
  isVerified?: boolean;
}

export interface FoxerLeaderboardResponse {
  entries: FoxerLeaderboardEntry[];
  userPosition: FoxerLeaderboardEntry | null;
  tab: FoxerLeaderboardTab;
  role?: string;
  city?: string;
  specialty?: string;
}

export async function getFoxerLeaderboard(
  tab: FoxerLeaderboardTab = "top_rated",
  role?: string,
  city?: string,
  specialty?: string,
): Promise<FoxerLeaderboardResponse> {
  const params: Record<string, string> = { tab };
  if (role) params.role = role;
  if (city) params.city = city;
  if (specialty) params.specialty = specialty;
  const res = await api.get("/leaderboard/foxers", { params });
  return (
    res.data?.data ?? {
      entries: [],
      userPosition: null,
      tab,
    }
  );
}

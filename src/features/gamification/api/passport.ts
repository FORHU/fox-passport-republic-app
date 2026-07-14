import api from "@/shared/lib/axios";
import { Badge, PassportStamp, PathProgress, PATH_COLORS, BADGE_COLORS } from "../types/gamification";
import { getPathLabel, calculateXPForNextLevel } from "../lib/gamification";

export interface ApiPassport {
  id: string;
  userId: string;
  paths: ApiPassportPath[];
  stamps: ApiPassportStamp[];
  userBadges: ApiUserBadge[];
}

export interface ApiPassportPath {
  id: string;
  path: string;
  level: number;
  currentXP: number;
  totalXP: number;
}

export interface ApiPassportStamp {
  id: string;
  bookingId: string;
  eventName: string;
  eventDate: string;
  location: string | null;
  xpEarned: number;
  imageUrl: string | null;
}

export interface ApiUserBadge {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: ApiBadge;
}

export interface ApiBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string | null;
  rarity: string;
  path: string | null;
  criteria: string | null;
}

export async function getMyPassport(): Promise<ApiPassport> {
  const res = await api.get("/passport/me");
  return res.data.data;
}

export async function getAllBadges(): Promise<ApiBadge[]> {
  const res = await api.get("/passport/badges");
  return res.data.data;
}

export async function getUserPassport(userId: string): Promise<ApiPassport> {
  const res = await api.get(`/passport/${userId}`);
  return res.data.data;
}

// Maps API passport paths → FE PathProgress[]
export function mapPaths(apiPaths: ApiPassportPath[]): PathProgress[] {
  return apiPaths.map((p) => {
    const path = p.path as PathProgress["path"];
    const requiredXP = calculateXPForNextLevel(p.level);
    return {
      path,
      level: p.level,
      currentXP: p.currentXP,
      requiredXP,
      totalXP: p.totalXP,
      label: getPathLabel(path, p.level),
      color: PATH_COLORS[path] ?? "#ccff00",
    };
  });
}

// Maps API stamps → FE PassportStamp[]
export function mapStamps(apiStamps: ApiPassportStamp[]): PassportStamp[] {
  return apiStamps.map((s) => ({
    id: s.id,
    eventId: s.bookingId,
    eventTitle: s.eventName,
    eventDate: new Date(s.eventDate),
    location: s.location ?? "",
    xpEarned: s.xpEarned,
    imageUrl: s.imageUrl ?? undefined,
  }));
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const res = await api.get(`/passport/leaderboard?limit=${limit}`);
  return res.data.data;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalXP: number;
  totalLevel: number;
  user: { id: string; name: string; imgId: string | null; roleType: string[] };
}

export async function getOutgoingMatchRequests(): Promise<OutgoingMatchGroup[]> {
  const res = await api.get("/event-template/matches/outgoing");
  return res.data.data;
}

export async function getIncomingMatchRequests(): Promise<IncomingMatchRequest[]> {
  const res = await api.get("/event-template/matches/incoming");
  return res.data.data;
}

export async function respondToMatch(matchId: string, type: string, status: "accepted" | "declined"): Promise<void> {
  await api.patch(`/event-template/matches/${matchId}/respond`, { type, status });
}

export interface MatchRequestItem {
  id: string;
  matchRequestStatus: "pending" | "accepted" | "declined" | "secured";
  matchedAt: string | null;
  description: string | null;
  date: string | null;
  type: "asset" | "service" | "venue";
  provider: { id: string; name: string; imgId: string | null } | null;
  item: { id: string; name: string } | null;
}

export interface OutgoingMatchGroup {
  templateId: string;
  templateName: string;
  category: string;
  targetCity: string | null;
  targetState: string | null;
  requests: MatchRequestItem[];
}

export interface IncomingMatchRequest extends MatchRequestItem {
  template: {
    id: string;
    name: string;
    category: string;
    targetCity: string | null;
    targetState: string | null;
    owner: { id: string; name: string; imgId: string | null };
  };
}

// Merges all badge definitions with user's earned badges
export function mapBadges(allBadges: ApiBadge[], userBadges: ApiUserBadge[]): Badge[] {
  const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, new Date(ub.earnedAt)]));
  return allBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    rarity: b.rarity as Badge["rarity"],
    icon: b.icon,
    color: b.color ?? BADGE_COLORS[b.rarity as Badge["rarity"]],
    path: b.path as Badge["path"] ?? undefined,
    earnedAt: earnedMap.get(b.id),
  }));
}

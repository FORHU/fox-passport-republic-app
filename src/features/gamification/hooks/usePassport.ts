"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyPassport, getAllBadges, getUserPassport, mapPaths, mapStamps, mapBadges,
  getLeaderboard, getOutgoingMatchRequests, getIncomingMatchRequests, getClientMatchRequests, respondToMatch,
} from "../api/passport";

export function useMyPassport() {
  const passportQuery = useQuery({
    queryKey: ["passport", "me"],
    queryFn: getMyPassport,
  });

  const badgesQuery = useQuery({
    queryKey: ["passport", "badges"],
    queryFn: getAllBadges,
  });

  const passport = passportQuery.data;
  const allBadges = badgesQuery.data ?? [];

  const paths = passport ? mapPaths(passport.paths) : [];
  const stamps = passport ? mapStamps(passport.stamps) : [];
  const badges = passport ? mapBadges(allBadges, passport.userBadges) : [];
  const perks: string[] = passport?.perks ?? [];

  return {
    passport,
    paths,
    stamps,
    badges,
    perks,
    isLoading: passportQuery.isLoading || badgesQuery.isLoading,
    isError: passportQuery.isError || badgesQuery.isError,
  };
}

export function useLeaderboard(limit = 20) {
  return useQuery({
    queryKey: ["passport", "leaderboard", limit],
    queryFn: () => getLeaderboard(limit),
  });
}

export function useOutgoingMatchRequests(enabled = true) {
  return useQuery({
    queryKey: ["matches", "outgoing"],
    queryFn: getOutgoingMatchRequests,
    enabled,
  });
}

export function useIncomingMatchRequests(enabled = true) {
  return useQuery({
    queryKey: ["matches", "incoming"],
    queryFn: getIncomingMatchRequests,
    enabled,
  });
}

export function useClientMatchRequests(offset = 0, enabled = true) {
  return useQuery({
    queryKey: ["matches", "client-inbox", offset],
    queryFn: () => getClientMatchRequests(10, offset),
    enabled,
  });
}

export function useRespondToMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matchId, type, status }: { matchId: string; type: string; status: "accepted" | "declined" }) =>
      respondToMatch(matchId, type, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUserPassport(userId: string) {
  const passportQuery = useQuery({
    queryKey: ["passport", userId],
    queryFn: () => getUserPassport(userId),
    enabled: !!userId,
  });

  const badgesQuery = useQuery({
    queryKey: ["passport", "badges"],
    queryFn: getAllBadges,
  });

  const passport = passportQuery.data;
  const allBadges = badgesQuery.data ?? [];

  const paths = passport ? mapPaths(passport.paths) : [];
  const stamps = passport ? mapStamps(passport.stamps) : [];
  const badges = passport ? mapBadges(allBadges, passport.userBadges) : [];

  return {
    passport,
    paths,
    stamps,
    badges,
    isLoading: passportQuery.isLoading || badgesQuery.isLoading,
    isError: passportQuery.isError || badgesQuery.isError,
  };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPassport, getAllBadges, getUserPassport, mapPaths, mapStamps, mapBadges } from "../api/passport";

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

  return {
    passport,
    paths,
    stamps,
    badges,
    isLoading: passportQuery.isLoading || badgesQuery.isLoading,
    isError: passportQuery.isError || badgesQuery.isError,
  };
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

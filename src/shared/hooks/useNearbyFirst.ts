"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export type NearbyScope = "near" | "everywhere";

/**
 * Lists that default to the signed-in user's own city (from the address they
 * gave in onboarding) and fall back to everywhere when that city has nothing
 * yet — so "near you" never shows an empty section. Guests, and users with
 * no city on file, simply get everywhere.
 *
 * `fetcher` receives the city to scope to, or undefined for everywhere.
 */
export function useNearbyFirst<T>(
  key: readonly unknown[],
  fetcher: (city?: string) => Promise<T[]>,
  options: { staleTime?: number } = {},
) {
  const city = useAuthStore((s) => s.user?.city)?.trim() || "";
  const [scope, setScope] = useState<NearbyScope>("near");
  const staleTime = options.staleTime ?? 1000 * 60 * 5;

  const wantNear = !!city && scope === "near";

  const near = useQuery({
    queryKey: [...key, "city", city.toLowerCase()],
    queryFn: () => fetcher(city),
    enabled: wantNear,
    staleTime,
    retry: 1,
  });
  // Nothing in their city yet (or the scoped call failed): show everywhere.
  const nearEmpty =
    wantNear && near.isSuccess && (near.data?.length ?? 0) === 0;
  const fallBack = nearEmpty || (wantNear && near.isError);

  const all = useQuery({
    queryKey: [...key, "everywhere"],
    queryFn: () => fetcher(undefined),
    enabled: !wantNear || fallBack,
    staleTime,
    retry: 1,
  });

  const usingNear = wantNear && !fallBack;
  const active = usingNear ? near : all;

  return {
    /** The user's city, or "" when there isn't one. */
    city,
    scope,
    setScope,
    /** True when the list shown is scoped to `city`. */
    usingNear,
    /** The user asked for nearby but their city had nothing. */
    nearEmpty,
    data: (active.data ?? []) as T[],
    isLoading: (wantNear && near.isLoading) || (!usingNear && all.isLoading),
    isError: !usingNear && all.isError,
    error: all.error,
  };
}

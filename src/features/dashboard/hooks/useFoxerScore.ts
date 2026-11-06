"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyFoxerScore, type FoxerScoreData } from "@/shared/api/foxerScore";

export function useFoxerScore() {
  return useQuery<FoxerScoreData>({
    queryKey: ["foxer-score", "me"],
    queryFn: getMyFoxerScore,
    staleTime: 60_000,
  });
}

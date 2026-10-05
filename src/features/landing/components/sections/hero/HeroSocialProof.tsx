"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

interface FoxerPreview {
  id: string;
  name: string;
  imgId?: string | null;
}

/** A few real Foxers and the real total — nothing here is made up. */
async function fetchFoxerPreview(): Promise<{
  foxers: FoxerPreview[];
  total: number;
}> {
  const res = await api.get("/users/foxers", { params: { limit: 3, page: 1 } });
  return {
    foxers: res.data?.data ?? [],
    total: res.data?.pagination?.total ?? 0,
  };
}

const compact = (n: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export function HeroSocialProof() {
  const { data } = useQuery({
    queryKey: ["foxers", "hero-preview"],
    queryFn: fetchFoxerPreview,
    staleTime: 1000 * 60 * 10,
  });

  // Until there's something true to say, say nothing.
  if (!data || data.total === 0) return null;

  const extra = data.total - data.foxers.length;

  return (
    <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
      <div className="flex -space-x-4 hover:space-x-0 transition-all duration-500">
        {data.foxers.map((foxer) =>
          foxer.imgId ? (
            <img
              key={foxer.id}
              alt={foxer.name}
              title={foxer.name}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-background object-cover hover:scale-110 hover:z-10 transition-transform"
              src={foxer.imgId}
            />
          ) : (
            <div
              key={foxer.id}
              title={foxer.name}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-background bg-surface-highlight text-white text-xs font-bold hover:scale-110 hover:z-10 transition-transform"
            >
              {foxer.name?.charAt(0)?.toUpperCase() || "F"}
            </div>
          ),
        )}
        {extra > 0 && (
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-surface-highlight text-white border-2 border-background text-[10px] sm:text-xs font-bold">
            +{compact(extra)}
          </div>
        )}
      </div>
      <Link
        href="/search"
        className="text-xs sm:text-sm font-medium text-text-muted hover:text-white transition-colors"
      >
        <span className="block font-bold text-white">
          {compact(data.total)} verified Foxer{data.total === 1 ? "" : "s"}
        </span>
        ready to make your event happen
      </Link>
    </div>
  );
}

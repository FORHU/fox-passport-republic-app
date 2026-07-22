"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import SearchFilters from "@/features/search/components/SearchFilters";
import EventFoxersSection from "@/features/search/components/EventFoxersSection";
import EventTemplatesSection from "@/features/search/components/EventTemplatesSection";
import GearServiceBento from "@/features/search/components/GearServiceBento";
import {
  fetchEventFoxers,
  fetchEventTemplates,
  fetchGearFoxers,
  fetchServiceFoxers,
  foxersToRows,
} from "@/features/search/api/search";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams?.get("q") || "";
  const category = searchParams?.get("category") || "";
  const city = searchParams?.get("label") || searchParams?.get("city") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";
  const startDate = searchParams?.get("startDate") || "";
  const endDate = searchParams?.get("endDate") || "";

  const [searchQuery, setSearchQuery] = useState(q);
  const [efPage, setEfPage] = useState(1);
  const [etPage, setEtPage] = useState(1);
  const [gsPage, setGsPage] = useState(1);

  useEffect(() => {
    setEfPage(1);
    setEtPage(1);
    setGsPage(1);
  }, [q, category, city, maxPrice, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams?.get("q") || "";
      if (searchQuery !== currentQ) {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.replace(`/search?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  const filters = useMemo(() => ({
    ...(city && { city }),
    ...(category && { category }),
    ...(maxPrice && { maxPrice }),
    ...(q && { q }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }), [city, category, maxPrice, q, startDate, endDate]);

  const { data: efData, isFetching: efFetching } = useQuery({
    queryKey: ["eventFoxers", efPage, city, category, maxPrice, q, startDate, endDate],
    queryFn: () => fetchEventFoxers(efPage, 2, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: etData, isFetching: etFetching } = useQuery({
    queryKey: ["eventTemplates", etPage, city, category, maxPrice, q, startDate, endDate],
    queryFn: () => fetchEventTemplates(etPage, 6, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: gfData, isFetching: gfFetching } = useQuery({
    queryKey: ["gearFoxers", gsPage, city, category, maxPrice, q, startDate, endDate],
    queryFn: () => fetchGearFoxers(gsPage, 5, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: sfData, isFetching: sfFetching } = useQuery({
    queryKey: ["serviceFoxers", gsPage, city, category, maxPrice, q, startDate, endDate],
    queryFn: () => fetchServiceFoxers(gsPage, 5, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const eventFoxers = efData?.items ?? [];
  const eventTemplates = etData?.items ?? [];
  const gearFoxers = gfData?.items ?? [];
  const serviceFoxers = sfData?.items ?? [];

  const efTotalPages = efData?.pagination?.totalPages ?? 1;
  const etTotalPages = etData?.pagination?.totalPages ?? 1;
  const gsTotalPages = Math.max(
    gfData?.pagination?.totalPages ?? 1,
    sfData?.pagination?.totalPages ?? 1,
    1
  );

  const gearRows = useMemo(() => foxersToRows(gearFoxers), [gearFoxers]);
  const serviceRows = useMemo(() => foxersToRows(serviceFoxers), [serviceFoxers]);

  return (
    <div className="min-h-screen bg-[#0c0d14] text-white pt-32 pb-12 px-8 relative">
      <div className="absolute top-0 left-0 w-full border-b border-white/5 bg-[#0c0d14] z-40">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="material-symbols-outlined text-black text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-white">Discover</span>
          </Link>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ANYTHING..."
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-6 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all tracking-wider"
            />
          </div>

          {(category || city) && (
            <div className="flex items-center gap-2 ml-auto text-xs text-white/50">
              {category && (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 capitalize">{category}</span>
              )}
              {city && (
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {city}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row gap-8">
          <aside className="w-80 shrink-0">
            <SearchFilters />
          </aside>
          <main className="flex-1 min-w-0 space-y-16">
            <EventFoxersSection
              items={eventFoxers}
              isFetching={efFetching}
              page={efPage}
              totalPages={efTotalPages}
              onPageChange={setEfPage}
            />
            <EventTemplatesSection
              items={eventTemplates}
              isFetching={etFetching}
              page={etPage}
              totalPages={etTotalPages}
              onPageChange={setEtPage}
            />
            <GearServiceBento
              gearItems={gearRows}
              serviceItems={serviceRows}
              isFetching={gfFetching || sfFetching}
              page={gsPage}
              totalPages={gsTotalPages}
              onPageChange={setGsPage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

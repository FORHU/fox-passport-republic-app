/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchFilters from "@/features/search/components/SearchFilters";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import EventFoxersSection from "@/features/search/components/EventFoxersSection";
import EventTemplatesSection from "@/features/search/components/EventTemplatesSection";
import GearServiceBento from "@/features/search/components/GearServiceBento";
import {
  fetchEventFoxers,
  fetchEventTemplates,
  fetchGearFoxers,
  fetchServiceFoxers,
} from "@/features/search/api/search";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams?.get("q") || "";
  const category = searchParams?.get("category") || "";
  const city = searchParams?.get("label") || searchParams?.get("city") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";

  const [searchQuery, setSearchQuery] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [efPage, setEfPage] = useState(1);
  const [etPage, setEtPage] = useState(1);
  const [gsPage, setGsPage] = useState(1);

  useEffect(() => {
    setEfPage(1);
    setEtPage(1);
    setGsPage(1);
  }, [q, category, city, maxPrice]);

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

  const filters = useMemo(
    () => ({
      ...(city && { city }),
      ...(category && { category }),
      ...(maxPrice && { maxPrice }),
      ...(q && { q }),
    }),
    [city, category, maxPrice, q],
  );

  const { data: efData, isFetching: efFetching } = useQuery({
    queryKey: [
      "eventFoxers",
      efPage,
      city,
      category,
      maxPrice,
      q,
    ],
    queryFn: () => fetchEventFoxers(efPage, 2, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: etData, isFetching: etFetching } = useQuery({
    queryKey: [
      "eventTemplates",
      etPage,
      city,
      category,
      maxPrice,
      q,
    ],
    queryFn: () => fetchEventTemplates(etPage, 6, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: gfData, isFetching: gfFetching } = useQuery({
    queryKey: [
      "gearFoxers",
      gsPage,
      city,
      category,
      maxPrice,
      q,
    ],
    queryFn: () => fetchGearFoxers(gsPage, 5, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const { data: sfData, isFetching: sfFetching } = useQuery({
    queryKey: [
      "serviceFoxers",
      gsPage,
      city,
      category,
      maxPrice,
      q,
    ],
    queryFn: () => fetchServiceFoxers(gsPage, 5, filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  });

  const eventFoxers = efData?.items ?? [];
  const eventTemplates = etData?.items ?? [];
  const gearRows = gfData?.items ?? [];
  const serviceRows = sfData?.items ?? [];

  const efTotalPages = efData?.pagination?.totalPages ?? 1;
  const etTotalPages = etData?.pagination?.totalPages ?? 1;
  const gsTotalPages = Math.max(
    gfData?.pagination?.totalPages ?? 1,
    sfData?.pagination?.totalPages ?? 1,
    1,
  );

  const TYPE_CHIPS = [
    { label: "All", value: "" },
    { label: "Event Foxers", value: "event_foxer" },
    { label: "Events", value: "event_template" },
    { label: "Gear", value: "gear" },
    { label: "Services", value: "service" },
  ];

  const [activeChip, setActiveChip] = useState(searchParams?.get("type") || "");

  const handleChipClick = (val: string) => {
    setActiveChip(val);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (val) params.set("type", val);
    else params.delete("type");
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0c0d14] text-white relative">
      <LandingHeader
        onSignIn={() => useAuthStore.getState().openLogin()}
        search={{ value: searchQuery, onChange: setSearchQuery }}
      />

      {/* Body — top padding clears the fixed nav above */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-28 pb-28 sm:pb-12">
        {/* Active filter badges */}
        {(category || city) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 mb-4">
            {category && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 capitalize">
                {category}
              </span>
            )}
            {city && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  location_on
                </span>
                {city}
              </span>
            )}
          </div>
        )}

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          {/* Horizontal type chips + mobile Filters trigger */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto hide-scrollbar mb-6 pb-0.5">
            <SheetTrigger asChild>
              <button className="flex-none flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap bg-white/6 border border-white/10 text-white">
                <span className="material-symbols-outlined text-[14px]">
                  tune
                </span>
                Filters
                {(category || city || maxPrice) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
                )}
              </button>
            </SheetTrigger>
            {TYPE_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleChipClick(chip.value)}
                className="flex-none text-[11px] font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap"
                style={{
                  background:
                    activeChip === chip.value
                      ? "#ccff00"
                      : "rgba(255,255,255,0.06)",
                  color:
                    activeChip === chip.value
                      ? "#000"
                      : "rgba(255,255,255,0.6)",
                  border:
                    activeChip === chip.value
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <SheetContent
            side="bottom"
            className="bg-[#0c0d14] border-white/10 h-[75vh] max-h-[85vh] overflow-y-auto rounded-t-3xl p-4"
          >
            <SheetTitle className="sr-only">Filters</SheetTitle>
            <SearchFilters />
          </SheetContent>
        </Sheet>

        <div className="flex flex-col sm:flex-row gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden sm:block w-80 shrink-0 self-start sticky top-36">
            <SearchFilters />
          </aside>

          <main className="flex-1 min-w-0 space-y-12 sm:space-y-16">
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

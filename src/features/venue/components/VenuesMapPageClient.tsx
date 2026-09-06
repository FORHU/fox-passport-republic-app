"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Users, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  VenuesMap,
  MapVenue,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/shared/components/ui/VenuesMap";
import {
  fetchVenuesByViewport,
  ViewportBounds,
} from "@/features/venue/api/venues";

interface VenuesMapPageClientProps {
  venues: any[];
}

interface ListVenue extends MapVenue {
  image: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  capacity: number;
  description: string;
  category: string;
}

const FALLBACK_VENUE_IMG = "/herobackground.jpg";

function resolveVenueImage(v: any): string {
  if (typeof v === "string" && v.trim().length > 0) {
    return v.trim();
  }
  if (!v || typeof v !== "object") {
    return FALLBACK_VENUE_IMG;
  }
  if (typeof v.imageUrl === "string" && v.imageUrl.trim().length > 0) {
    return v.imageUrl.trim();
  }
  if (typeof v.image === "string" && v.image.trim().length > 0) {
    return v.image.trim();
  }
  if (typeof v.img === "string" && v.img.trim().length > 0) {
    return v.img.trim();
  }
  if (Array.isArray(v.images) && v.images.length > 0) {
    const first = v.images[0];
    if (typeof first === "string" && first.trim().length > 0) {
      return first.trim();
    }
    if (first && typeof first === "object") {
      const u = first.url || first.imageUrl || first.secure_url;
      if (typeof u === "string" && u.trim().length > 0) {
        return u.trim();
      }
    }
  }
  return FALLBACK_VENUE_IMG;
}

function VenueListCard({
  venue,
  selected,
  onSelect,
}: {
  venue: ListVenue;
  selected: boolean;
  onSelect: () => void;
}) {
  const imageSrc = resolveVenueImage(venue);

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border transition-all overflow-hidden bg-white/5 hover:bg-white/10 ${
        selected
          ? "border-[#ccff00] ring-1 ring-[#ccff00] bg-white/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-28 shrink-0 rounded-xl overflow-hidden bg-white/5">
          <Image
            src={imageSrc || FALLBACK_VENUE_IMG}
            alt={venue.name || "Venue"}
            fill
            sizes="112px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-bold text-white truncate">
              {venue.name}
            </h3>
            {venue.category && (
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[venue.category] ?? "#ccff00"}20`,
                  color: CATEGORY_COLORS[venue.category] ?? "#ccff00",
                  border: `1px solid ${CATEGORY_COLORS[venue.category] ?? "#ccff00"}40`,
                }}
              >
                {CATEGORY_LABELS[venue.category] ?? venue.category}
              </span>
            )}
          </div>
          {venue.location && (
            <p className="text-xs text-white/40 truncate mt-0.5">
              {venue.location}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/50">
            {venue.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#ccff00] text-[#ccff00]" />
                {venue.rating.toFixed(1)}
                {venue.reviews > 0 && (
                  <span className="text-white/30">({venue.reviews})</span>
                )}
              </span>
            )}
            {venue.capacity > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {venue.capacity}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="text-sm font-bold text-white">
              ₱{venue.price.toLocaleString()}
              <span className="text-[10px] font-normal text-white/40">
                /night
              </span>
            </p>
            <Link
              href={`/venues/${venue.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating detail card over the map — appears when a pin is selected on the screen.
function VenueDetailCard({
  venue,
  onClose,
  buildingCompanions = [],
  onSelectCompanion,
}: {
  venue: ListVenue;
  onClose: () => void;
  buildingCompanions?: ListVenue[];
  onSelectCompanion?: (id: string) => void;
}) {
  const detailImage = resolveVenueImage(venue);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="absolute bottom-6 left-6 z-20 w-[calc(100%-3rem)] sm:max-w-sm rounded-[2rem] border border-[#ccff00]/30 bg-[#0b0d14]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      <div className="relative h-40 w-full bg-white/5">
        <Image
          src={detailImage || FALLBACK_VENUE_IMG}
          alt={venue.name || "Venue"}
          fill
          sizes="384px"
          className="object-cover"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        {venue.category && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md shadow"
            style={{
              backgroundColor: `${CATEGORY_COLORS[venue.category] ?? "#ccff00"}30`,
              color: CATEGORY_COLORS[venue.category] ?? "#ccff00",
              border: `1px solid ${CATEGORY_COLORS[venue.category] ?? "#ccff00"}50`,
            }}
          >
            {CATEGORY_LABELS[venue.category] ?? venue.category}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">
            {venue.name}
          </h3>
          {venue.location && (
            <p className="text-xs text-white/40 mt-0.5">{venue.location}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-white/60">
          {venue.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#ccff00] text-[#ccff00]" />
              {venue.rating.toFixed(1)}
              {venue.reviews > 0 && (
                <span className="text-white/30">
                  ({venue.reviews} review{venue.reviews === 1 ? "" : "s"})
                </span>
              )}
            </span>
          )}
          {venue.capacity > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Up to {venue.capacity} guests
            </span>
          )}
        </div>

        {venue.description && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
            {venue.description}
          </p>
        )}

        {/* Same Building / Complex Companions */}
        {buildingCompanions && buildingCompanions.length > 0 && (
          <div className="pt-2.5 border-t border-white/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
              <span>🏢</span>
              <span>
                Also in this building ({buildingCompanions.length + 1}{" "}
                spaces/events):
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {buildingCompanions.map((comp) => (
                <button
                  type="button"
                  key={comp.id}
                  onClick={() => onSelectCompanion?.(comp.id)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-xs transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-white truncate max-w-[130px] group-hover:text-[#ccff00] transition-colors">
                    {comp.name}
                  </span>
                  <span className="text-[10px] text-lime-400 font-bold">
                    ₱{comp.price.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <p className="text-base font-bold text-white">
            ₱{venue.price.toLocaleString()}
            <span className="text-xs font-normal text-white/40">/night</span>
          </p>
          <Link
            href={`/venues/${venue.id}`}
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function VenuesMapPageClient({
  venues: initialVenues,
}: VenuesMapPageClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Viewport-bounded state: only load what is on the screen!
  const [mapRawVenues, setMapRawVenues] = useState<any[]>(initialVenues ?? []);
  const [rawVenues, setRawVenues] = useState<any[]>(initialVenues ?? []);
  const [totalCount, setTotalCount] = useState<number>(
    initialVenues?.length ?? 0,
  );
  const [page, setPage] = useState<number>(1);
  const [currentBounds, setCurrentBounds] = useState<ViewportBounds | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [isLoadingViewport, setIsLoadingViewport] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Debounce viewport queries (350ms) to prevent API spam while actively dragging
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every viewport/search fetch so a slower, now-stale response
  // (e.g. an earlier viewport before a quick pan) can't clobber a newer one.
  const viewportFetchSeqRef = useRef(0);

  const listParentRef = useRef<HTMLDivElement>(null);

  const normalizeListVenue = useCallback((v: any): ListVenue => {
    const resolvedImg = resolveVenueImage(v);
    return {
      id: v.id,
      name: v.title ?? v.name ?? "Untitled venue",
      lat: v.lat,
      lng: v.lng,
      boundary: v.boundary,
      subtitle: v.loc ?? v.location ?? undefined,
      imageUrl: resolvedImg !== FALLBACK_VENUE_IMG ? resolvedImg : null,
      image: resolvedImg,
      location: v.loc ?? v.location ?? "",
      price: Number(v.price) || 0,
      rating: Number(v.rating) || 0,
      reviews: Number(v.reviews) || 0,
      capacity: Number(v.guestCount ?? v.capacity) || 0,
      description: v.description ?? "",
      category:
        typeof v.category === "object"
          ? (v.category?.name ?? v.category?.slug ?? "")
          : (v.category ?? ""),
    };
  }, []);

  const mapVenues: ListVenue[] = useMemo(
    () =>
      (mapRawVenues ?? [])
        .filter((v) => v.lat != null && v.lng != null)
        .map(normalizeListVenue),
    [mapRawVenues, normalizeListVenue],
  );

  const listVenues: ListVenue[] = useMemo(
    () =>
      (rawVenues ?? [])
        .filter((v) => v.lat != null && v.lng != null)
        .map(normalizeListVenue),
    [rawVenues, normalizeListVenue],
  );

  const selectedVenue = useMemo(
    () => mapVenues.find((v) => v.id === selectedId) ?? null,
    [mapVenues, selectedId],
  );

  // All venues/events sharing the exact same building/coordinate with selected venue
  const buildingCompanions = useMemo(() => {
    if (
      !selectedVenue ||
      selectedVenue.lat == null ||
      selectedVenue.lng == null
    ) {
      return [];
    }
    const selLat = selectedVenue.lat;
    const selLng = selectedVenue.lng;
    return mapVenues.filter(
      (v) =>
        v.id !== selectedVenue.id &&
        v.lat != null &&
        v.lng != null &&
        Math.abs(v.lat - selLat) < 0.00015 &&
        Math.abs(v.lng - selLng) < 0.00015,
    );
  }, [selectedVenue, mapVenues]);

  // When camera moves, query the screen bounding box
  const handleViewportChange = useCallback(
    (bounds: ViewportBounds) => {
      setCurrentBounds(bounds);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        setIsLoadingViewport(true);
        const seq = ++viewportFetchSeqRef.current;
        try {
          // Fetch max 1000 for the map (lightweight)
          fetchVenuesByViewport({
            ...bounds,
            page: 1,
            limit: 1000,
            lightweight: true,
            search: debouncedSearch || undefined,
          })
            .then((resp) => {
              if (seq === viewportFetchSeqRef.current) {
                setMapRawVenues(resp.venues);
              }
            })
            .catch(() => {});

          // Fetch 12 for the list
          const resp = await fetchVenuesByViewport({
            ...bounds,
            page: 1,
            limit: 12,
            search: debouncedSearch || undefined,
          });
          if (seq !== viewportFetchSeqRef.current) return;
          setRawVenues(resp.venues);
          setTotalCount(resp.total);
          setPage(1);
          listParentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          console.warn("Could not query viewport venues:", err);
        } finally {
          if (seq === viewportFetchSeqRef.current) {
            setIsLoadingViewport(false);
          }
        }
      }, 350);
    },
    [debouncedSearch],
  );

  // Refetch when search changes
  useEffect(() => {
    if (currentBounds) {
      handleViewportChange(currentBounds);
    }
  }, [debouncedSearch, handleViewportChange]);

  const totalPages = Math.ceil(totalCount / 12);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (
        isLoadingMore ||
        isLoadingViewport ||
        !currentBounds ||
        newPage < 1 ||
        newPage > totalPages
      )
        return;
      setIsLoadingMore(true);

      try {
        const resp = await fetchVenuesByViewport({
          ...currentBounds,
          page: newPage,
          limit: 12,
          search: debouncedSearch || undefined,
        });
        // Replace entirely for pagination instead of appending
        setRawVenues(resp.venues);
        setTotalCount(resp.total);
        setPage(newPage);
        // Scroll to top
        listParentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.warn("Error loading page:", err);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [
      isLoadingMore,
      isLoadingViewport,
      currentBounds,
      totalPages,
      debouncedSearch,
    ],
  );

  // Observer for sentinel div at bottom of sidebar (Auto-Pagination)
  const sentinelBottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelBottomRef.current;
    if (!el) return;
    // IntersectionObserver reports the sentinel's *current* visibility as
    // soon as observe() is called, before any real scrolling happens. If a
    // page's cards don't fill the sidebar's visible height (short pages,
    // the last partial page, a tall viewport), that first callback alone
    // would advance the page — whose new sentinel then does the same,
    // cascading through every remaining page with no user interaction.
    // Skipping that one synchronous callback and only acting on a later,
    // genuine visibility change fixes it without affecting real scrolling.
    let isInitialCallback = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isInitialCallback) {
          isInitialCallback = false;
          return;
        }
        if (entries[0].isIntersecting && page < totalPages) {
          handlePageChange(page + 1);
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handlePageChange, page, totalPages]);

  // Selection handlers: bidirectional sync between map pin & sidebar card
  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleMapVenueClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    // Scroll card into view
    cardRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  return (
    <div className="h-screen w-full bg-[#02040a] text-white font-body flex flex-col overflow-hidden">
      <div className="flex-1 w-full flex min-h-0 pt-16 sm:pt-28">
        {/* Left: scrollable venue list */}
        <div
          className={`${mobileView === "map" ? "hidden" : "flex"} sm:flex w-full sm:w-[400px] lg:w-[440px] shrink-0 flex-col border-r border-white/10 min-h-0`}
        >
          <div className="px-4 sm:px-6 py-4 shrink-0">
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <button
                onClick={() => router.back()}
                aria-label="Back"
                className="h-8 w-8 -ml-1.5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
              </button>
              <span className="material-symbols-outlined text-[#ccff00]">
                map
              </span>
              Venues Map
            </h1>

            {/* Search Bar */}
            <div className="mt-4 mb-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search venues or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00]/50 transition-all"
                />
              </div>
            </div>

            {/* Screen-Scoped Counter */}
            <div className="flex items-center justify-between mt-1 text-xs">
              <p className="text-white/40">
                {isLoadingViewport ? (
                  <span className="flex items-center gap-1.5 text-[#ccff00] font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                    viewport...
                  </span>
                ) : (
                  <span>
                    Showing{" "}
                    <strong className="text-white">{listVenues.length}</strong>{" "}
                    of <strong className="text-white">{totalCount}</strong>{" "}
                    venues on screen
                  </span>
                )}
              </p>
              {currentBounds && (
                <span className="text-[10px] font-mono text-[#ccff00]/60 bg-[#ccff00]/10 px-2 py-0.5 rounded-full border border-[#ccff00]/20">
                  Live Viewport
                </span>
              )}
            </div>

            {/* Category Badges */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-[10px] text-white/50"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: CATEGORY_COLORS[key] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* List Container with Infinite Scroll */}
          <div
            ref={listParentRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-3"
          >
            {isLoadingViewport && listVenues.length === 0 ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-28 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : listVenues.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-16 flex flex-col items-center justify-center gap-2 text-white/30 text-center px-4">
                <span className="material-symbols-outlined text-[36px] text-white/20">
                  travel_explore
                </span>
                <p className="text-sm font-semibold text-white/60">
                  No venues in this screen area
                </p>
                <p className="text-xs text-white/40 max-w-xs">
                  Pan or zoom the map to discover venues across other regions or
                  cities.
                </p>
              </div>
            ) : (
              <>
                <div className="relative w-full space-y-3 pb-4">
                  {listVenues.map((venue) => (
                    <div
                      key={venue.id}
                      ref={(el) => {
                        cardRefs.current[venue.id] = el;
                      }}
                    >
                      <VenueListCard
                        venue={venue}
                        selected={venue.id === selectedId}
                        onSelect={() => handleSelect(venue.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 py-4 border-t border-white/10 mt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!hasPrevPage || isLoadingMore}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ← Prev
                    </button>
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-xs text-[#ccff00] font-mono">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
                        Page {page} of {totalPages}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasNextPage || isLoadingMore}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                )}

                {/* Auto-Pagination Sentinel */}
                <div ref={sentinelBottomRef} className="h-1 w-full" />
              </>
            )}
          </div>
        </div>

        {/* Right: Map fills viewport */}
        <div
          className={`${mobileView === "map" ? "block" : "hidden"} sm:block relative flex-1 min-w-0 p-4`}
        >
          <VenuesMap
            venues={mapVenues}
            fitToContent={false}
            zoom={6}
            selectedVenueId={selectedId}
            onVenueClick={handleMapVenueClick}
            onBuildingClick={(clusterVenues) => {
              if (clusterVenues.length > 0) {
                setSelectedId(clusterVenues[0].id);
              }
            }}
            onViewportChange={handleViewportChange}
            className="h-full w-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
          />

          {/* Floating Selected Card over Map */}
          <AnimatePresence>
            {selectedVenue && (
              <VenueDetailCard
                key={selectedVenue.id}
                venue={selectedVenue}
                onClose={() => setSelectedId(null)}
                buildingCompanions={buildingCompanions}
                onSelectCompanion={setSelectedId}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 p-1 shadow-2xl">
          <button
            onClick={() => setMobileView("list")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              mobileView === "list"
                ? "bg-[#ccff00] text-black"
                : "text-white/60"
            }`}
          >
            List ({listVenues.length})
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              mobileView === "map" ? "bg-[#ccff00] text-black" : "text-white/60"
            }`}
          >
            Map
          </button>
        </div>
      </div>
    </div>
  );
}

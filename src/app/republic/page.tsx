"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FeedPost, FeedTab } from "@/features/republic/types";
import { getFeed } from "@/shared/api/feed";
import { RepublicTabs } from "@/features/republic/components/RepublicTabs";
import { ComposePostBox } from "./_components/ComposePostBox";
import { PostCard } from "@/features/republic/components/PostCard";
import { CitizenProfileSidebarCard } from "@/features/republic/components/CitizenProfileSidebarCard";
import { PartnerEquipmentDepotCard } from "@/features/republic/components/PartnerEquipmentDepotCard";
import { SuggestedCitizensWidget } from "@/features/republic/components/SuggestedCitizensWidget";
import PartnerInventoryMap from "@/features/investment/components/PartnerInventoryMap";
import RepublicHeader from "@/features/republic/components/RepublicHeader";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";

const VALID_TABS: FeedTab[] = ["all", "community", "marketplace", "partners"];

function RepublicFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FeedTab | null;
  const initialTab: FeedTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "all";

  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [mode, setMode] = useState<"recent" | "top">("recent");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [mobileComposeOpen, setMobileComposeOpen] = useState(false);
  const postsListRef = useRef<HTMLDivElement>(null);

  // Sync activeTab when URL query changes (e.g. navigation from menu)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("all");
    }
  }, [tabParam]);

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    if (tab === "all") {
      router.replace("/republic", { scroll: false });
    } else {
      router.replace(`/republic?tab=${tab}`, { scroll: false });
    }
    // A tab switch is a deliberate action, not the scroll sentinel — jumping
    // back to the top of the (about-to-change) list is the right call here,
    // unlike auto-pagination further down.
    postsListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Sentinel ref for auto-pagination
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch 10 posts per page — replaces the visible page rather than
  // accumulating everything ever loaded, same pagination model as
  // /venues/map: bounded DOM per page, page resets to 1 on a fresh load
  // (no cursor), advances on an explicit "load next page" call.
  const fetchPosts = useCallback(
    async (tab: FeedTab, term: string, currentMode: "recent" | "top", cursor?: string) => {
      try {
        if (!cursor) setLoading(true);
        const res = await getFeed({
          tab,
          search: term.trim().length > 0 ? term.trim() : undefined,
          cursor,
          limit: 10,
          mode: currentMode,
        });

        setPosts(res.data);
        setNextCursor(res.nextCursor ?? null);
        if (!cursor) setPage(1);
      } catch (err) {
        console.error("Failed to load feed posts:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPosts(activeTab, search, mode);
  }, [activeTab, search, mode, fetchPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    postsListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Unlike /venues/map's page buttons, this fires from the scroll sentinel
  // itself — the whole point is to let scrolling down keep surfacing more
  // posts. Snapping back to the top of the list on every trigger (as the
  // map does) would fight that: the user scrolls down, gets yanked to the
  // top, and has to scroll all the way back down just to reach the sentinel
  // for the *next* page. So no scroll reset here — the replaced page's
  // content simply continues in place.
  const handleLoadMore = useCallback(() => {
    if (!nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    setPage((p) => p + 1);
    fetchPosts(activeTab, search, mode, nextCursor);
  }, [nextCursor, loadingMore, loading, activeTab, search, mode, fetchPosts]);

  // ── Auto-pagination sentinel ──────────────────────────────────────────────
  // IntersectionObserver reports the sentinel's *current* visibility as soon
  // as observe() runs, before any real scrolling — with only ~10 posts per
  // page (replaced, not accumulated), a page can easily be shorter than the
  // viewport, and that first synchronous callback alone would advance to the
  // next page, whose sentinel does the same, cascading through every page
  // with no user interaction. Skipping that one callback and only acting on
  // a later, genuine visibility change fixes it (same issue and fix as
  // /venues/map's pagination).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let isInitialCallback = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isInitialCallback) {
          isInitialCallback = false;
          return;
        }
        const [entry] = entries;
        if (entry.isIntersecting && nextCursor && !loadingMore && !loading) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "350px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, [nextCursor, loadingMore, loading, handleLoadMore]);

  const activeTabLabels: Record<FeedTab, string> = {
    all: "All Feeds",
    community: "Community Stories",
    marketplace: "Marketplace Offers",
    partners: "Partner Investments",
  };

  return (
    <div className="min-h-screen bg-[#09090e] text-white pb-36 pt-16 selection:bg-lime-400 selection:text-black">
      {/* ── FULL-WIDTH DOCKED HEADER (Flush at top: 0, height 64px) ────────── */}
      <RepublicHeader />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* ── LOCKED CONTROL BAR (Slim, Docks FLUSH underneath header at top-16) ─── */}
        <div className="md:hidden sticky top-16 z-40 py-2.5 bg-[#09090e]/95 backdrop-blur-2xl border-b border-zinc-800/80 -mx-3 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2">
          {/* Stream Tabs (Horizontal swipeable pills) */}
          <div className="flex-1 min-w-0">
            <RepublicTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              orientation="horizontal"
            />
          </div>

          {/* Quick Create Post Action */}
          <button
            onClick={() => {
              setMobileComposeOpen((prev) => !prev);
              setTimeout(() => {
                document
                  .getElementById("republic-mobile-composer")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }}
            className={`shrink-0 py-2 px-3 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              mobileComposeOpen
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                : "bg-lime-400 hover:bg-lime-300 text-black"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {mobileComposeOpen ? "close" : "edit_note"}
            </span>
            <span className="hidden xs:inline">
              {mobileComposeOpen ? "Close" : "Post"}
            </span>
          </button>
        </div>

        {/* ── SCREEN-ADAPTIVE RESPONSIVE LAYOUT (Mobile, Tablet, Desktop) ─── */}
        <div className="flex flex-col md:flex-row gap-6 items-start justify-center pt-5">
          {/* ── LEFT COLUMN (Locked at Top, Never Scrolls Away) ─────────────── */}
          <aside className="hidden md:block w-64 xl:w-80 shrink-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto space-y-4 h-fit [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Direct Back to Home link */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-800/80 transition-all shadow-sm group cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-lime-400 group-hover:-translate-x-1 transition-all">
                  arrow_back
                </span>
                Back to Main Page
              </Link>
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Republic
              </span>
            </div>

            {/* Profile Icon / Passport Card */}
            <CitizenProfileSidebarCard />

            {/* Below Profile: Community, Marketplace, Partners & All */}
            <RepublicTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              orientation="vertical"
            />

            {/* On Medium screens (md to xl), also tuck the Partner Hub here if the 3rd column is hidden */}
            <div className="xl:hidden space-y-3">
              <PartnerEquipmentDepotCard
                mapSlot={
                  <PartnerInventoryMap className="h-[360px] w-full rounded-2xl overflow-hidden" />
                }
              />
            </div>

            {/* Quick Republic Resource Links */}
            <div className="rounded-3xl bg-zinc-950/60 border border-zinc-900 p-4 space-y-2 text-xs">
              <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Republic Shortcuts
              </div>
              <Link
                href="/republic/investments"
                className="flex items-center justify-between text-zinc-400 hover:text-amber-300 py-1.5 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">
                    explore
                  </span>
                  Full Inventory Map
                </span>
                <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/foxer/create-investment"
                className="flex items-center justify-between text-zinc-400 hover:text-lime-400 py-1.5 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-lime-400">
                    add_circle
                  </span>
                  Register Equipment Hub
                </span>
                <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/venue-foxer/create-venue"
                className="flex items-center justify-between text-zinc-400 hover:text-pink-400 py-1.5 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-pink-400">
                    polyline
                  </span>
                  Draw & Add Venue
                </span>
                <span className="material-symbols-outlined text-[14px] text-zinc-600 group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </aside>

          {/* ── MIDDLE COLUMN (Spacious Feeds & Floating Search) ────────────── */}
          <main className="flex-1 min-w-0 max-w-2xl xl:max-w-2xl space-y-5 w-full min-h-[85vh]">
            {/* Search Input (Flows naturally on mobile, sticky on desktop) */}
            <div className="md:sticky md:top-20 z-30 backdrop-blur-xl bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <span className="material-symbols-outlined absolute left-3.5 text-zinc-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search feeds, creators, venues..."
                  className="w-full bg-zinc-900/95 border border-zinc-800 focus:border-lime-400/70 rounded-xl pl-10 pr-24 sm:pr-28 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setSearch("");
                      }}
                      className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-800 border border-zinc-700/80 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-lime-400 truncate">
                    {activeTabLabels[activeTab]}
                  </span>
                </div>
              </form>
            </div>
            {/* Feed Sort Toggle */}
            <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl w-full sm:w-max mx-auto sm:mx-0 shadow-sm">
              <button
                onClick={() => setMode("recent")}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                  mode === "recent"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setMode("top")}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  mode === "top"
                    ? "bg-gradient-to-r from-lime-500/20 to-emerald-500/20 text-lime-400 border border-lime-500/30 shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  hotel_class
                </span>
                Top Posts
              </button>
            </div>

            {/* Mobile-only Suggested Citizens (Horizontal/hidden on desktop) */}
            <div className="xl:hidden w-full overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <SuggestedCitizensWidget />
            </div>

            {/* Mobile-only Quick Depots Map Link */}
            <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-zinc-900 border border-amber-500/20 text-xs shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0">
                  inventory_2
                </span>
                <span className="font-bold text-zinc-200 text-xs truncate">
                  Equipment Depots & Capital
                </span>
              </div>
              <Link
                href="/republic/investments"
                className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-black transition-colors"
              >
                View Map →
              </Link>
            </div>

            {/* On Mobile & Medium screens (< xl), render the Compose Box or expandable prompt */}
            <div id="republic-mobile-composer" className="xl:hidden space-y-2 scroll-mt-28">
              {mobileComposeOpen ? (
                <div className="p-3 sm:p-4 rounded-3xl bg-zinc-900/95 border border-zinc-800 space-y-2 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-lime-400">
                      Create Republic Post
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileComposeOpen(false)}
                      className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        close
                      </span>
                    </button>
                  </div>
                  <ComposePostBox
                    onPostCreated={() => {
                      setMobileComposeOpen(false);
                      fetchPosts(activeTab, search, mode);
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMobileComposeOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-lime-400/40 text-left text-xs text-zinc-400 hover:text-white transition-all shadow-md group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400/10 text-lime-400 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[16px]">
                        edit_note
                      </span>
                    </span>
                    <span className="truncate">
                      Share an update, offer gear, or tell a story...
                    </span>
                  </span>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-lime-400 text-black font-bold">
                    Post
                  </span>
                </button>
              )}
            </div>

            {/* In the middle it only has the feeds */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-52 rounded-3xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="w-full rounded-3xl bg-zinc-950/60 border border-zinc-800/80 p-12 text-center space-y-3 shadow-xl">
                <span className="material-symbols-outlined text-[52px] text-zinc-600">
                  inbox
                </span>
                <h3 className="text-base font-bold text-zinc-300">
                  No posts in this stream yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  {search
                    ? `No posts matched your search for "${search}". Try different keywords or reset your filter.`
                    : "Be the trailblazer and share the very first update with the Republic!"}
                </p>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              <div ref={postsListRef} className="space-y-4 scroll-mt-24">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={(id) => {
                      setPosts((prev) => prev.filter((p) => p.id !== id));
                    }}
                  />
                ))}

                {/* Auto-Pagination Sentinel */}
                <div ref={sentinelRef} className="h-1 w-full" />

                {/* Loading indicator while the next page fetches */}
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-zinc-400 text-xs">
                    <span className="w-5 h-5 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
                    <span>Loading page {page}...</span>
                  </div>
                ) : nextCursor ? (
                  <div className="text-center py-6">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      Page {page} · Scroll for more
                    </span>
                  </div>
                ) : (
                  posts.length > 0 && (
                    <div className="text-center py-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-500">
                        <span className="material-symbols-outlined text-[15px] text-lime-400">
                          check_circle
                        </span>
                        You&apos;re all caught up on this stream
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </main>

          {/* ── RIGHT COLUMN (Large Desktop xl: >= 1280px) ──────────────────── */}
          <aside className="hidden xl:block w-80 xl:w-96 shrink-0 xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto space-y-5 h-fit [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Top Right: Partner Equipment Depots & Capital Pool */}
            <PartnerEquipmentDepotCard
              mapSlot={
                <PartnerInventoryMap className="h-[380px] w-full rounded-2xl overflow-hidden" />
              }
            />

            {/* Below Partner Equipment Depots: The Uploading (ComposePostBox) */}
            <div className="space-y-2">
              <div className="px-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Publish Update</span>
                <span className="text-lime-400 font-bold">+15 XP / Post</span>
              </div>
              <ComposePostBox
                onPostCreated={() => fetchPosts(activeTab, search, mode)}
              />
            </div>

            {/* Suggested Citizens Discovery Layer */}
            <SuggestedCitizensWidget />
          </aside>
        </div>
      </div>

      {/* ── MOBILE BOTTOM FLOATING NAVIGATION ─────────────────────────────── */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default function RepublicFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090e] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-500 text-xs">
            <span className="w-8 h-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
            <span>Loading Republic Feed...</span>
          </div>
        </div>
      }
    >
      <RepublicFeedContent />
    </Suspense>
  );
}

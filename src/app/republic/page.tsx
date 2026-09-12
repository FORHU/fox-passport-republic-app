"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Inbox, Search } from "lucide-react";
import { FeedPost, FeedTab } from "@/features/republic/types";
import { getFeed, getPostById } from "@/shared/api/feed";
import { RepublicTabs } from "@/features/republic/components/RepublicTabs";
import { ComposePostTrigger } from "@/features/republic/components/ComposePostTrigger";
import { ComposePostModal } from "@/features/republic/components/ComposePostModal";
import { FeedSortMenu } from "@/features/republic/components/FeedSortMenu";
import { PostCard } from "@/features/republic/components/PostCard";
import { PostDetailModal } from "@/features/republic/components/PostDetailModal";
import { FollowingWidget } from "@/features/republic/components/FollowingWidget";
import { RepublicLeftSidebar } from "@/features/republic/components/RepublicLeftSidebar";
import { RepublicRightSidebar } from "@/features/republic/components/RepublicRightSidebar";
import { RepublicMobileControlBar } from "@/features/republic/components/RepublicMobileControlBar";
import PartnerInventoryMap from "@/features/investment/components/PartnerInventoryMap";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";

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
  const [composeOpen, setComposeOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const postsListRef = useRef<HTMLDivElement>(null);

  // The app hides scrollbars globally (see .custom-scrollbar in globals.css)
  // so infinite-scroll feeds like this one give no visual sense of how much
  // is left. Opt this page's page-level scrollbar back in for as long as
  // it's mounted, so scroll position is always visible.
  useEffect(() => {
    document.documentElement.classList.add("custom-scrollbar");
    return () => {
      document.documentElement.classList.remove("custom-scrollbar");
    };
  }, []);

  const handleOpenDetail = useCallback((post: FeedPost) => {
    setActivePost(post);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActivePost(null);
    if (searchParams.get("postId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("postId");
      const query = params.toString();
      router.replace(query ? `/republic?${query}` : "/republic", {
        scroll: false,
      });
    }
  }, [router, searchParams]);

  // Deep link support: PostCard's Share button already copies a
  // `?postId=` URL — this is the read side, opening that post's detail
  // modal directly on load rather than leaving the link a dead end.
  useEffect(() => {
    const postId = searchParams.get("postId");
    if (!postId) return;
    let cancelled = false;
    getPostById(postId)
      .then((post) => {
        if (!cancelled) setActivePost(post);
      })
      .catch((err) => {
        console.error("Failed to load shared post:", err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync activeTab when URL query changes (e.g. navigation from menu)
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("all");
    }
  }, [tabParam]);

  const handleTabChange = useCallback(
    (tab: FeedTab) => {
      // Re-selecting the already-active tab would replace the URL with
      // itself — a no-op navigation NavigationOverlay can't detect as
      // "completed", so skip it entirely rather than relying on that guard.
      if (tab === activeTab) return;
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
    },
    [router, activeTab],
  );

  // Fetch 10 posts at a time. A cursor means this is a "load more" call from
  // the scroll sentinel, so its results append onto what's already on screen
  // — true infinite scroll, the last-loaded post flows straight into the
  // next batch instead of the page being swapped out from under the reader.
  // No cursor means a fresh load (initial mount, or the tab/search/mode
  // changed), so it replaces whatever was there before.
  const fetchPosts = useCallback(
    async (
      tab: FeedTab,
      term: string,
      currentMode: "recent" | "top",
      cursor?: string,
    ) => {
      try {
        if (!cursor) setLoading(true);
        const res = await getFeed({
          tab,
          search: term.trim().length > 0 ? term.trim() : undefined,
          cursor,
          limit: 10,
          mode: currentMode,
        });

        if (cursor) {
          setPosts((prev) => [...prev, ...res.data]);
        } else {
          setPosts(res.data);
        }
        setNextCursor(res.nextCursor ?? null);
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

  // Shared success handler for the compose modal, wherever it was opened
  // from — refetches the current feed view rather than assuming a full
  // reload is needed.
  const handleDesktopPostCreated = useCallback(() => {
    fetchPosts(activeTab, search, mode);
  }, [fetchPosts, activeTab, search, mode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    postsListRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Fires from the scroll sentinel itself — the whole point is to let
  // scrolling down keep surfacing more posts appended to the bottom of the
  // list. No scroll reset here: unlike a tab switch, this shouldn't yank the
  // reader back to the top of a list that's simply grown underneath them.
  const handleLoadMore = useCallback(() => {
    if (!nextCursor || loadingMore || loading) return;
    setLoadingMore(true);
    fetchPosts(activeTab, search, mode, nextCursor);
  }, [nextCursor, loadingMore, loading, activeTab, search, mode, fetchPosts]);

  // `handleLoadMore` is recreated on every render (it closes over nextCursor/
  // loading/loadingMore so its own internal guard stays correct), which used
  // to be a dependency of the observer effect below — so the observer itself
  // got torn down and rebuilt after every single page load. Each rebuild
  // reset `isInitialCallback`, and IntersectionObserver re-fires that
  // synchronous "here's your current visibility" callback the instant
  // observe() runs again — with the sentinel still inside the generous
  // 350px rootMargin (easy with ~10 short post cards), the guard meant to
  // filter that one callback landed on a doomed brand-new observer each
  // time, so it kept slipping through and immediately loading the next page,
  // whose completion tore down and rebuilt the observer again — cascading
  // through every page in one burst instead of stopping to wait for a real
  // scroll. Routing calls through a ref lets the observer itself be created
  // exactly once (mount-only deps) while still always invoking the current
  // `handleLoadMore` closure.
  const handleLoadMoreRef = useRef(handleLoadMore);
  useEffect(() => {
    handleLoadMoreRef.current = handleLoadMore;
  }, [handleLoadMore]);

  // ── Auto-pagination sentinel ──────────────────────────────────────────────
  // A callback ref rather than a plain ref + useEffect: the sentinel <div>
  // only exists in the JSX branch below once `loading` is false and posts
  // are non-empty, so a mount-once (`[]`-deps) effect would run before that
  // div ever exists, find nothing to observe, and never run again. A
  // callback ref instead fires exactly when React actually attaches or
  // detaches the node — on the real initial mount, and again on each tab/
  // search/mode change (which remounts this whole branch), but *not* on a
  // plain load-more, since the sentinel div stays mounted throughout that.
  //
  // IntersectionObserver reports the sentinel's *current* visibility as soon
  // as observe() runs, before any real scrolling — with only ~10 posts in
  // the first batch, the list can easily be shorter than the viewport, and
  // that first synchronous callback alone would advance to the next batch.
  // Skipping that one callback and only acting on a later, genuine
  // visibility change fixes it (same issue and fix as /venues/map's
  // pagination).
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null);
  const sentinelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect();
    sentinelObserverRef.current = null;
    if (!node) return;

    let isInitialCallback = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isInitialCallback) {
          isInitialCallback = false;
          return;
        }
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoadMoreRef.current();
        }
      },
      {
        root: null,
        rootMargin: "350px",
        threshold: 0.1,
      },
    );

    observer.observe(node);
    sentinelObserverRef.current = observer;
  }, []);

  return (
    <div className="min-h-screen bg-[#09090e] text-white pb-36 pt-16 sm:pt-28 selection:bg-lime-400 selection:text-black">
      {/* ── SAME FLOATING PILL HEADER USED ON / , /search, /venues/map ──────── */}
      <LandingHeader />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
        {/* ── LOCKED MOBILE CONTROL BAR (Slim, docks under the floating header) ─ */}
        <RepublicMobileControlBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onComposeOpen={() => setComposeOpen(true)}
        />

        {/* ── SCREEN-ADAPTIVE RESPONSIVE LAYOUT (Mobile, Tablet, Desktop) ─── */}
        <div className="flex flex-col md:flex-row gap-6 items-start justify-center pt-5">
          {/* ── LEFT COLUMN (Locked at Top, Never Scrolls Away) ─────────────── */}
          <RepublicLeftSidebar
            mapSlot={
              <PartnerInventoryMap
                className="h-[360px] w-full rounded-2xl overflow-hidden"
              />
            }
          />

          {/* ── MIDDLE COLUMN (Spacious Feeds & Floating Search) ────────────── */}
          <main className="flex-1 min-w-0 max-w-2xl xl:max-w-2xl space-y-5 w-full min-h-[85vh]">
            {/* Search Input */}
            <div className="relative z-30 backdrop-blur-xl bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
                <Search
                  className="absolute left-3.5 h-[18px] w-[18px] text-zinc-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search feeds, creators, venues..."
                  className="w-full bg-zinc-900/95 border border-zinc-800 focus:border-lime-400/70 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />

                {searchInput && (
                  <div className="absolute right-2.5 flex items-center gap-1.5">
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
                  </div>
                )}
              </form>
            </div>

            {/* Publish Update — same trigger-opens-modal composer used
                everywhere else, placed right under the search bar so it's
                the first thing seen on every breakpoint. */}
            <div className="space-y-1.5">
              <ComposePostTrigger onOpen={() => setComposeOpen(true)} />
            </div>

            {/* Feed filters — stream (All Feeds/Community/...) and sort
                (Recent/Top Posts), grouped together instead of one being
                buried inside the search bar. */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-black text-white">Posts</span>
              <div className="flex items-center gap-1">
                <RepublicTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  orientation="dropdown"
                />
                <span className="w-px h-4 bg-zinc-800" />
                <FeedSortMenu mode={mode} onChange={setMode} />
              </div>
            </div>

            {/* Following — tablet only; hidden on mobile (too cramped
                there) and hidden on xl+ (already in the right sidebar) */}
            <div className="hidden md:block xl:hidden w-full overflow-x-auto snap-x snap-mandatory pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <FollowingWidget />
            </div>

            {/* Mobile Equipment Depots link — rendered by RepublicMobileControlBar */}

            {/* Feed stream */}
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
                <Inbox
                  className="h-[52px] w-[52px] text-zinc-600 mx-auto"
                  strokeWidth={1.5}
                />
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
                    onOpenDetail={handleOpenDetail}
                    onPostDeleted={(id) => {
                      setPosts((prev) => prev.filter((p) => p.id !== id));
                    }}
                  />
                ))}

                {/* Auto-Pagination Sentinel */}
                <div ref={sentinelCallbackRef} className="h-1 w-full" />

                {/* Loading indicator while the next batch fetches */}
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-zinc-400 text-xs">
                    <span className="w-5 h-5 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
                    <span>Loading more posts...</span>
                  </div>
                ) : nextCursor ? (
                  <div className="text-center py-6">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      Scroll for more
                    </span>
                  </div>
                ) : (
                  posts.length > 0 && (
                    <div className="text-center py-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-bold text-zinc-500">
                        <CheckCircle2
                          className="h-[15px] w-[15px] text-lime-400"
                          strokeWidth={2}
                        />
                        You&apos;re all caught up on this stream
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </main>

          {/* ── RIGHT COLUMN (Large Desktop xl: >= 1280px) ──────────────────── */}
          <RepublicRightSidebar />
        </div>
      </div>

      {activePost && (
        <PostDetailModal
          post={activePost}
          onClose={handleCloseDetail}
          onPostDeleted={(id) => {
            setPosts((prev) => prev.filter((p) => p.id !== id));
            handleCloseDetail();
          }}
        />
      )}

      {/* Shared compose modal — every trigger point (desktop sidebar,
          mobile control bar, mobile inline prompt) opens this same one. */}
      {composeOpen && (
        <ComposePostModal
          onClose={() => setComposeOpen(false)}
          onPostCreated={handleDesktopPostCreated}
        />
      )}

      {/* Dark-theme thumb — the default .custom-scrollbar in globals.css is
          tuned for light backgrounds and would be invisible here. */}
      <style jsx global>{`
        html.custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        html.custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        html.custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.14);
          border-radius: 20px;
        }
        html.custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 230, 53, 0.35);
        }
        html.custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
        }
      `}</style>
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

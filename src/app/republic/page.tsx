"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, CheckCircle2, Inbox, Search } from "lucide-react";
import { FeedPost, FeedTab } from "@/features/republic/types";
import {
  getFeed,
  getPostById,
  type FeedMode,
  type FeedResponse,
} from "@/shared/api/feed";
import { useNewPostsCount } from "@/features/republic/hooks/useNewPostsCount";
import {
  onRepublicRefresh,
  takePendingRepublicRefresh,
} from "@/shared/lib/republic-refresh";
import { RepublicTabs } from "@/features/republic/components/RepublicTabs";
import { ComposePostTrigger } from "@/features/republic/components/ComposePostTrigger";
import { ComposePostModal } from "@/features/republic/components/ComposePostModal";
import { FeedSortMenu } from "@/features/republic/components/FeedSortMenu";
import { PostCard } from "@/features/republic/components/PostCard";
import { PostDetailModal } from "@/features/republic/components/PostDetailModal";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import { RepublicLeftSidebar } from "@/features/republic/components/RepublicLeftSidebar";
import { RepublicRightSidebar } from "@/features/republic/components/RepublicRightSidebar";
import { RepublicMobileControlBar } from "@/features/republic/components/RepublicMobileControlBar";
import FollowingWidgetSection from "./FollowingWidgetSection";
import { ProductTour } from "@/shared/components/ui/ProductTour";
import { REPUBLIC_TOUR, REPUBLIC_TOUR_KEY } from "./republicTour";
import PartnerInventoryMap from "@/features/investment/components/PartnerInventoryMap";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { SharePostModal } from "@/features/messages/components/SharePostModal";
import { toast } from "sonner";
import { UNAVAILABLE_POST_MESSAGE } from "@/shared/lib/notificationLink";

const VALID_TABS: FeedTab[] = ["all", "community", "marketplace", "partners"];

function RepublicFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FeedTab | null;
  const initialTab: FeedTab =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "all";

  // A tapped hashtag (see renderUsernameMentions) lands here as
  // `?hashtag=foo` — there's no separate tag index, so this just seeds the
  // existing content search with the literal "#foo" substring.
  const hashtagParam = searchParams.get("hashtag");
  const initialSearch = hashtagParam ? `#${hashtagParam}` : "";

  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [mode, setMode] = useState<FeedMode>("foryou");
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const queryClient = useQueryClient();
  const [composeOpen, setComposeOpen] = useState(false);
  const [activePost, setActivePost] = useState<FeedPost | null>(null);
  const postsListRef = useRef<HTMLDivElement>(null);

  // The app hides scrollbars globally (see .custom-scrollbar in globals.css)
  // We apply the custom-scrollbar to the feed container below.
  useEffect(() => {
    // No longer applying to document.documentElement as the page is now fixed 100vh
  }, []);

  const handleOpenDetail = useCallback((post: FeedPost) => {
    setActivePost(post);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setActivePost(null);
    if (searchParams.get("postId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("postId");
      params.delete("commentId");
      const query = params.toString();
      router.replace(query ? `/republic?${query}` : "/republic", {
        scroll: false,
      });
    }
  }, [router, searchParams]);

  // Deep link support: PostCard's Share button already copies a
  // `?postId=` URL — this is the read side, opening that post's detail
  // modal directly on load rather than leaving the link a dead end.
  // Notifications link here too (`&commentId=` scrolls to a comment), and a
  // notification clicked while already on /republic only changes the query,
  // so this follows the params rather than running once on mount.
  const deepLinkPostId = searchParams.get("postId");
  const deepLinkCommentId = searchParams.get("commentId");
  const [focusCommentId, setFocusCommentId] = useState<string | null>(null);
  useEffect(() => {
    if (!deepLinkPostId) return;
    let cancelled = false;
    const requestedAt = Date.now();
    getPostById(deepLinkPostId)
      .then((post) => {
        usePostStatsStore.getState().syncFromServer([post], requestedAt);
        if (cancelled) return;
        setFocusCommentId(deepLinkCommentId);
        setActivePost(post);
      })
      .catch((err) => {
        console.error("Failed to load shared post:", err);
        if (cancelled) return;
        // Deleted, or no longer visible to this viewer: say so instead of
        // leaving the click with no visible result.
        toast.info(UNAVAILABLE_POST_MESSAGE);
        handleCloseDetail();
      });
    return () => {
      cancelled = true;
    };
    // handleCloseDetail changes with every query change; only a new target
    // should trigger a new load.
  }, [deepLinkPostId, deepLinkCommentId]);

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
      // itself — a no-op navigation RouteProgressBar can't detect as
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

  // 10 posts a page, cached per tab/search/mode. Scrolling appends the next
  // page onto what's already on screen — true infinite scroll, the
  // last-loaded post flows straight into the next batch. Coming back to the
  // feed (or to a tab already visited) paints the cached pages at once
  // instead of a spinner. `staleTime: 0` still refetches behind them on
  // every visit, since PostCard keeps saves and edits in its own state rather
  // than in this cache. Like and comment counts live in usePostStatsStore:
  // each fetched page is pushed there, so cards already on screen (and the
  // detail modal) pick up the fresh counts (BUG-25).
  const term = search.trim();
  const feedQueryKey = ["feed", activeTab, term, mode];
  const feedQuery = useInfiniteQuery({
    queryKey: feedQueryKey,
    queryFn: async ({ pageParam }) => {
      const requestedAt = Date.now();
      const page = await getFeed({
        tab: activeTab,
        search: term.length > 0 ? term : undefined,
        cursor: pageParam,
        limit: 10,
        mode,
      });
      usePostStatsStore.getState().syncFromServer(page.data, requestedAt);
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // A For you refetch is a new session, i.e. a reshuffle. Never do that
    // under the reader (window focus, reconnect); only on an explicit refresh,
    // or when coming back after a while (app#308). Recent keeps refetching.
    staleTime: mode === "foryou" ? 5 * 60_000 : 0,
    refetchOnWindowFocus: mode !== "foryou",
    refetchOnReconnect: mode !== "foryou",
  });

  // Posts picked up through the "New posts" pill (or the viewer's own new
  // post), shown above the session's list. Keyed by view, so switching tab,
  // search or mode drops them.
  const viewKey = `${activeTab}|${term}|${mode}`;
  const [freshPosts, setFreshPosts] = useState<{
    key: string;
    posts: FeedPost[];
  }>({ key: "", posts: [] });
  const prepended = useMemo(
    () => (freshPosts.key === viewKey ? freshPosts.posts : []),
    [freshPosts, viewKey],
  );

  // De-duplicated by id: a post can be both prepended and in a later page,
  // and a session's list can shift by one if a post is deleted mid-scroll.
  const posts = useMemo<FeedPost[]>(() => {
    const seen = new Set<string>();
    const out: FeedPost[] = [];
    for (const p of [
      ...prepended,
      ...(feedQuery.data?.pages.flatMap((page) => page.data) ?? []),
    ]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
    return out;
  }, [prepended, feedQuery.data]);
  const loading = feedQuery.isPending;

  // "Newer than what's on screen": For you's session start (server time),
  // Recent's newest post, or the newest post picked up since.
  const firstPage = feedQuery.data?.pages[0];
  const since = useMemo(() => {
    const candidates = [
      mode === "foryou" ? firstPage?.anchor : firstPage?.data[0]?.createdAt,
      prepended[0]?.createdAt,
    ].filter((t): t is string => !!t);
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) =>
      new Date(a).getTime() >= new Date(b).getTime() ? a : b,
    );
  }, [mode, firstPage, prepended]);
  // The count endpoint has no search, so the pill only runs on unfiltered feeds.
  const newCount = useNewPostsCount(
    since,
    activeTab,
    !loading && term.length === 0,
  );
  const [loadingNew, setLoadingNew] = useState(false);

  /** Puts posts newer than `since` on top, then scrolls up to them. */
  const showNewPosts = useCallback(async () => {
    if (!since) return;
    setLoadingNew(true);
    try {
      const requestedAt = Date.now();
      const page = await getFeed({ tab: activeTab, mode: "recent", limit: 20 });
      usePostStatsStore.getState().syncFromServer(page.data, requestedAt);
      const sinceMs = new Date(since).getTime();
      const newer = page.data.filter(
        (p) => new Date(p.createdAt).getTime() > sinceMs,
      );
      setFreshPosts((prev) => ({
        key: viewKey,
        posts: [...newer, ...(prev.key === viewKey ? prev.posts : [])],
      }));
    } catch (err) {
      console.error("Failed to load new posts:", err);
    } finally {
      setLoadingNew(false);
    }
    postsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [since, activeTab, viewKey]);

  /** A new session: a new For you mix, from the top. */
  const refreshFeed = useCallback(() => {
    setFreshPosts({ key: "", posts: [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
    queryClient.resetQueries({ queryKey: ["feed", activeTab, term, mode] });
  }, [queryClient, activeTab, term, mode]);

  // The nav's Republic button refreshes the feed (header pill, mobile bottom
  // bar): a click while here is heard live, and one made on another page is
  // taken when the feed mounts. Through a ref, so subscribing happens once.
  const refreshFeedRef = useRef(refreshFeed);
  useEffect(() => {
    refreshFeedRef.current = refreshFeed;
  }, [refreshFeed]);
  useEffect(() => {
    if (takePendingRepublicRefresh()) refreshFeedRef.current();
    return onRepublicRefresh(() => refreshFeedRef.current());
  }, []);
  const loadingMore = feedQuery.isFetchingNextPage;
  const hasMore = feedQuery.hasNextPage;

  useEffect(() => {
    if (feedQuery.isError)
      console.error("Failed to load feed posts:", feedQuery.error);
  }, [feedQuery.isError, feedQuery.error]);

  const removePost = useCallback(
    (id: string) => {
      setFreshPosts((prev) => ({
        ...prev,
        posts: prev.posts.filter((p) => p.id !== id),
      }));
      queryClient.setQueryData<InfiniteData<FeedResponse>>(
        feedQueryKey,
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((p) => p.id !== id),
            })),
          },
      );
    },
    // feedQueryKey is rebuilt each render from these three.
    [queryClient, activeTab, term, mode],
  );

  // Shared success handler for the compose modal, wherever it was opened
  // from — refetches every cached feed view (and the landing teaser), so
  // the new post shows up on whichever tab the author goes to next. The For
  // you list on screen is kept (a refetch would reshuffle it, and the new
  // post could land anywhere); the author's post is put on top instead.
  const handleDesktopPostCreated = useCallback(() => {
    if (mode !== "foryou") {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      return;
    }
    const onScreen = JSON.stringify(["feed", activeTab, term, mode]);
    queryClient.invalidateQueries({
      queryKey: ["feed"],
      predicate: (q) => JSON.stringify(q.queryKey) !== onScreen,
    });
    void showNewPosts();
  }, [queryClient, mode, activeTab, term, showNewPosts]);

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
  const { fetchNextPage } = feedQuery;
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    fetchNextPage();
  }, [hasMore, loadingMore, loading, fetchNextPage]);

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
    <div className="min-h-screen flex flex-col bg-canvas text-white pt-16 sm:pt-28 selection:bg-lime-400 selection:text-black">
      {/* ── SAME FLOATING PILL HEADER USED ON / , /search, /venues/map ──────── */}
      <LandingHeader />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 w-full flex-1 flex flex-col">
        {/* Mobile controls stay fixed within the viewport */}
        <RepublicMobileControlBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onComposeOpen={() => setComposeOpen(true)}
        />

        {/* Main three-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center pt-5 flex-1">
          {/* LEFT SIDEBAR
              - Sticky under the fixed header (top-28 = 7rem)
              - Capped at the viewport height below that offset and scrolls on
                its own, so a column taller than the screen (e.g. with the
                partner map open on a 768px-tall laptop) can still be fully
                reached instead of staying pinned with its bottom off-screen.
                No overscroll-contain: once the column hits its end, the wheel
                chains on to the page so the feed never feels trapped. */}
          <aside
            data-tour="republic-sidebar"
            className="hidden lg:block w-[320px] shrink-0 sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-12"
          >
            <RepublicLeftSidebar
              mapSlot={
                // dragPan={false} turns on cooperative gestures: a plain wheel
                // or drag over the inline map scrolls the sidebar/page instead
                // of being captured by the map (Ctrl/⌘ + wheel zooms it).
                <PartnerInventoryMap
                  className="h-[360px] w-full rounded-2xl overflow-hidden"
                  dragPan={false}
                />
              }
            />
          </aside>

          {/* CENTER FEED — scrolls with the page */}
          <main className="flex-1 min-w-0 max-w-2xl w-full px-1 pb-12">
            {/* Search Input */}
            <div
              data-tour="republic-search"
              className="relative z-30 backdrop-blur-xl bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-2 sm:p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
            >
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

            {/* Publish */}
            <div data-tour="republic-compose" className="space-y-1.5 mt-5">
              <ComposePostTrigger onOpen={() => setComposeOpen(true)} />
            </div>

            {/* Feed filters */}
            <div
              data-tour="republic-filters"
              className="flex items-center justify-between px-1 mt-5"
            >
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

            {/* Following — tablet and laptop, until the right sidebar fits (1408px) */}
            <div
              data-tour="republic-following"
              className="hidden md:block min-[1408px]:hidden w-full overflow-x-auto snap-x snap-mandatory pb-2 mt-5 -mx-3 px-3 sm:mx-0 sm:px-0"
            >
              <FollowingWidgetSection />
            </div>

            {/* Feed */}
            <div className="mt-5">
              {/* "New posts" pill: a zero-height sticky row, so it floats over
                  the list as you scroll and never pushes a post down. */}
              {newCount > 0 && (
                <div className="sticky top-24 sm:top-32 z-30 h-0 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void showNewPosts()}
                    disabled={loadingNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold shadow-[0_8px_24px_rgba(0,0,0,0.55)] transition-colors cursor-pointer disabled:opacity-70"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {newCount === 1 ? "1 new post" : `${newCount} new posts`}
                  </button>
                </div>
              )}

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-52 rounded-3xl bg-zinc-900/60 border border-zinc-800/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : feedQuery.isError && posts.length === 0 ? (
                <div className="w-full rounded-3xl bg-zinc-950/60 border border-red-500/30 p-12 text-center space-y-3 shadow-xl">
                  <span className="material-symbols-outlined text-[48px] text-red-400">
                    cloud_off
                  </span>
                  <h3 className="text-base font-bold text-zinc-200">
                    Unable to load Republic feed
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    We couldn&apos;t connect to the feed service. Please verify your connection or try again.
                  </p>
                  <button
                    onClick={() => feedQuery.refetch()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Retry
                  </button>
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
                <div
                  ref={postsListRef}
                  data-tour="republic-feed"
                  className="space-y-4 scroll-mt-24"
                >
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpenDetail={handleOpenDetail}
                      onPostDeleted={(id) => {
                        removePost(id);
                      }}
                      renderShareModal={(postToShare, onClose, onSent) => (
                        <SharePostModal
                          post={postToShare}
                          onClose={onClose}
                          onSent={onSent}
                        />
                      )}
                    />
                  ))}

                  {/* Infinite-scroll sentinel */}
                  <div ref={sentinelCallbackRef} className="h-1 w-full" />

                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-zinc-400 text-xs">
                      <span className="w-5 h-5 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
                      <span>Loading more posts...</span>
                    </div>
                  ) : hasMore ? (
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
            </div>
          </main>

          {/* RIGHT SIDEBAR — sticky under the fixed header */}
          <aside
            data-tour="republic-following"
            className="hidden min-[1408px]:block w-[320px] shrink-0 sticky top-28 pl-2 pb-12"
          >
            <RepublicRightSidebar>
              <FollowingWidgetSection />
            </RepublicRightSidebar>
          </aside>
        </div>
      </div>

      {activePost && (
        <PostDetailModal
          // A new target remounts the modal, so the comment list reloads
          // and scrolls to the new comment.
          key={`${activePost.id}:${focusCommentId ?? ""}`}
          post={activePost}
          focusCommentId={
            activePost.id === deepLinkPostId ? focusCommentId : null
          }
          onClose={handleCloseDetail}
          onPostDeleted={(id) => {
            removePost(id);
            handleCloseDetail();
          }}
          renderShareModal={(postToShare, onClose, onSent) => (
            <SharePostModal
              post={postToShare}
              onClose={onClose}
              onSent={onSent}
            />
          )}
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

      <ProductTour tourKey={REPUBLIC_TOUR_KEY} steps={REPUBLIC_TOUR} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function RepublicFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
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

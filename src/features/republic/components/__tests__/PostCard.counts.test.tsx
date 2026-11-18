import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/** app#303: every action shows its own count (hidden at 0), plus views. */

const api = vi.hoisted(() => ({
  trackPostShare: vi.fn(),
}));

vi.mock("@/shared/api/feed", () => ({
  trackPostShare: api.trackPostShare,
  recordPostViews: vi.fn().mockResolvedValue([]),
  setPostReaction: vi.fn(),
  getPostComments: vi.fn().mockResolvedValue([]),
  addPostComment: vi.fn(),
  deletePostComment: vi.fn(),
  editPost: vi.fn(),
  voteOnPoll: vi.fn(),
  searchMentionCandidates: vi.fn().mockResolvedValue([]),
  toggleCommentLike: vi.fn(),
  editPostComment: vi.fn(),
  getReactionBreakdown: vi.fn().mockResolvedValue([]),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/republic",
  useSearchParams: () => new URLSearchParams(),
}));

const makePost = (over: Partial<FeedPost> = {}) =>
  ({
    id: "p1",
    authorId: "author",
    type: "citizen_experience",
    tab: "all",
    content: "Hello Republic",
    mediaUrls: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    sendsCount: 0,
    repostsCount: 0,
    viewsCount: 0,
    isPinned: false,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    author: { id: "author", name: "Ada" },
    ...over,
  }) as unknown as FeedPost;

const bar = (container: HTMLElement) =>
  within(container.querySelector(".grid.grid-flow-col") as HTMLElement);

beforeEach(() => {
  vi.clearAllMocks();
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
  api.trackPostShare.mockResolvedValue({ counted: true, sharesCount: 3 });
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("PostCard action counts", () => {
  it("shows no number on any action when every count is 0", () => {
    const { container } = render(<PostCard post={makePost()} />);
    expect(bar(container).queryByText(/^\d/)).toBeNull();
    expect(within(container).queryByText(/views?$/)).toBeNull();
  });

  it("shows each action's own count, compacted", () => {
    const { container } = render(
      <PostCard
        post={makePost({
          likesCount: 12,
          commentsCount: 3,
          sharesCount: 4,
          sendsCount: 5,
          repostsCount: 1234,
        })}
      />,
    );
    const b = bar(container);
    for (const n of ["12", "3", "4", "5", "1.2k"]) {
      expect(b.getByText(n)).toBeTruthy();
    }
  });

  it("shows the view count above the bar", () => {
    const { container } = render(
      <PostCard post={makePost({ viewsCount: 1500 })} />,
    );
    expect(within(container).getByText("1.5k views")).toBeTruthy();
  });

  it("says 1 view, not 1 views", () => {
    const { container } = render(
      <PostCard post={makePost({ viewsCount: 1 })} />,
    );
    expect(within(container).getByText("1 view")).toBeTruthy();
  });

  const copyLink = (container: HTMLElement) => {
    const scope = within(container);
    fireEvent.click(scope.getByRole("button", { name: /share|copied/i }));
    fireEvent.click(scope.getByRole("menuitem", { name: /copy link/i }));
  };
  const shareTrigger = (container: HTMLElement) =>
    within(container).getByRole("button", { name: /share|copied/i });

  it("counts a copied link straight away and tells the API", async () => {
    const { container } = render(
      <PostCard post={makePost({ sharesCount: 2 })} />,
    );
    copyLink(container);

    await waitFor(() => expect(bar(container).getByText("3")).toBeTruthy());
    expect(api.trackPostShare).toHaveBeenCalledWith("p1");
    expect(shareTrigger(container).className).toContain("text-lime-400");
  });

  it("doesn't count the same viewer's repeat shares", async () => {
    const { container } = render(
      <PostCard post={makePost({ sharesCount: 2 })} />,
    );
    copyLink(container);
    await waitFor(() => expect(bar(container).getByText("3")).toBeTruthy());

    api.trackPostShare.mockResolvedValue({ counted: false, sharesCount: 3 });
    copyLink(container);
    copyLink(container);
    await waitFor(() => expect(api.trackPostShare).toHaveBeenCalledTimes(3));
    expect(bar(container).getByText("3")).toBeTruthy();
    expect(bar(container).queryByText("4")).toBeNull();
  });

  it("takes the server's count when the post was already shared", async () => {
    // e.g. shared earlier in another tab: no +1, and the server's count wins.
    api.trackPostShare.mockResolvedValue({ counted: false, sharesCount: 5 });
    const { container } = render(
      <PostCard post={makePost({ sharesCount: 5, isSharedByMe: true })} />,
    );
    expect(shareTrigger(container).className).toContain("text-lime-400");
    copyLink(container);
    await waitFor(() => expect(api.trackPostShare).toHaveBeenCalled());
    expect(bar(container).getByText("5")).toBeTruthy();
    expect(bar(container).queryByText("6")).toBeNull();
  });

  it("rolls the count back when the API refuses", async () => {
    api.trackPostShare.mockRejectedValue(new Error("down"));
    const { container } = render(
      <PostCard post={makePost({ sharesCount: 2 })} />,
    );
    copyLink(container);
    await waitFor(() => expect(api.trackPostShare).toHaveBeenCalled());
    await waitFor(() => expect(bar(container).getByText("2")).toBeTruthy());
    expect(shareTrigger(container).className).not.toContain("text-lime-400");
  });

  it("lets a signed-out viewer copy the link without counting it", async () => {
    useAuthStore.setState({ user: null } as never);
    const { container } = render(
      <PostCard post={makePost({ sharesCount: 2 })} />,
    );
    copyLink(container);
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalled(),
    );
    expect(api.trackPostShare).not.toHaveBeenCalled();
    expect(bar(container).getByText("2")).toBeTruthy();
  });

  it("names Send and Repost with their counts for screen readers", () => {
    const { container } = render(
      <PostCard post={makePost({ sendsCount: 2, repostsCount: 9 })} />,
    );
    const scope = within(container);
    expect(
      scope.getByRole("button", { name: "Send in message, 2" }),
    ).toBeTruthy();
    expect(scope.getByRole("button", { name: "Repost, 9" })).toBeTruthy();
  });

  it("has no Repost button, and so no repost count, on a repost", () => {
    const { container } = render(
      <PostCard
        post={makePost({ originalPostId: "orig", repostsCount: 7 } as never)}
      />,
    );
    expect(
      within(container).queryByRole("button", { name: /^Repost/ }),
    ).toBeNull();
    expect(bar(container).queryByText("7")).toBeNull();
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/** #302: each card's backdrop blur is its own stacking context, so the open
 * ⋯ menu was drawn under the next card. The card now lifts itself while a
 * menu inside it reports aria-expanded="true". */

vi.mock("@/shared/api/feed", () => ({
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
  deletePost: vi.fn(),
  hidePost: vi.fn(),
  toggleSavePost: vi.fn(),
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
    isPinned: false,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    author: { id: "author", name: "Ada" },
    ...over,
  }) as unknown as FeedPost;

const LIFT = "has-[[aria-expanded=true]]:z-20";

beforeEach(() => {
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
});

describe("PostOptionsMenu", () => {
  it("exposes the menu state on the ⋯ button", () => {
    render(<PostCard post={makePost()} onOpenDetail={() => {}} />);
    const trigger = screen.getByRole("button", { name: "Post options" });

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Report Post" }),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it.each([
    ["regular", makePost()],
    ["pinned", makePost({ isPinned: true })],
    [
      "partner",
      makePost({ type: "partner_announcement" } as Partial<FeedPost>),
    ],
  ])("lifts a %s card above its siblings while a menu is open", (_, post) => {
    const { container } = render(
      <PostCard post={post} onOpenDetail={() => {}} />,
    );
    const article = container.querySelector("article")!;

    expect(article.className).toContain(LIFT);
    fireEvent.click(screen.getByRole("button", { name: "Post options" }));
    expect(article.querySelector('[aria-expanded="true"]')).not.toBeNull();
  });

  it("lifts the card in the detail modal too", () => {
    const { container } = render(
      <PostCard post={makePost()} variant="modal" />,
    );
    expect(container.querySelector("article")!.className).toContain(LIFT);
  });
});

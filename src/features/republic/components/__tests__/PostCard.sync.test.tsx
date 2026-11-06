import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost, PostComment } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/** BUG-25: the feed card and the detail modal (a second PostCard) kept their
 * own like and comment counts, so one went stale whenever the other changed. */

const api = vi.hoisted(() => ({
  setPostReaction: vi.fn(),
  getPostComments: vi.fn(),
  addPostComment: vi.fn(),
  deletePostComment: vi.fn(),
}));

vi.mock("@/shared/api/feed", () => ({
  ...api,
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

const post: FeedPost = {
  id: "p1",
  authorId: "author",
  type: "citizen_experience",
  tab: "all",
  content: "Hello Republic",
  mediaUrls: [],
  likesCount: 5,
  commentsCount: 2,
  sharesCount: 0,
  isPinned: false,
  isLikedByMe: false,
  myReaction: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  author: { id: "author", name: "Ada" },
} as unknown as FeedPost;

const comment = (id: string, over: Partial<PostComment> = {}) =>
  ({
    id,
    postId: "p1",
    authorId: "me",
    content: `comment ${id}`,
    likesCount: 0,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    author: { id: "me", name: "Me" },
    replies: [],
    ...over,
  }) as unknown as PostComment;

const renderBoth = () => {
  const card = render(<PostCard post={post} onOpenDetail={() => {}} />);
  const modal = render(<PostCard post={post} variant="modal" />);
  return { card: within(card.container), modal: within(modal.container) };
};

const likeButton = (scope: ReturnType<typeof within>) =>
  scope.getByText("👍").closest("button")!;

beforeEach(() => {
  vi.clearAllMocks();
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
  api.getPostComments.mockResolvedValue([]);
});

describe("PostCard count sync", () => {
  it("shows a like made in the modal on the feed card too", async () => {
    api.setPostReaction.mockResolvedValue({ reaction: "like", likesCount: 6 });
    const { card, modal } = renderBoth();

    fireEvent.click(likeButton(modal));

    await waitFor(() => expect(api.setPostReaction).toHaveBeenCalledWith("p1", "like"));
    expect(likeButton(card).textContent).toContain("6");
    expect(likeButton(modal).textContent).toContain("6");
  });

  it("rolls the like back on both when the request fails", async () => {
    api.setPostReaction.mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { card, modal } = renderBoth();

    fireEvent.click(likeButton(card));

    await waitFor(() => expect(likeButton(card).textContent).toContain("5"));
    expect(likeButton(modal).textContent).toContain("5");
  });

  it("counts a comment added in the modal on the feed card right away", async () => {
    api.addPostComment.mockResolvedValue(comment("c-new"));
    const { card, modal } = renderBoth();
    const input = await modal.findByPlaceholderText("Write a comment...");

    fireEvent.change(input, { target: { value: "Nice" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => expect(card.getByText("3")).toBeTruthy());
  });

  it("drops a deleted comment and its replies from the count", async () => {
    api.getPostComments.mockResolvedValue([
      comment("c1", { replies: [comment("r1")] }),
    ]);
    api.deletePostComment.mockResolvedValue(undefined);
    const { card, modal } = renderBoth();
    await modal.findByText("comment c1");

    fireEvent.click(modal.getAllByTitle("Delete comment")[0]);

    await waitFor(() => expect(card.getByText("0")).toBeTruthy());
    expect(api.deletePostComment).toHaveBeenCalledWith("p1", "c1");
  });
});

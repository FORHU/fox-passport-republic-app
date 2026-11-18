import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/**
 * app#308: For you labels an older post it brought back ("From earlier") and
 * marks only its one rotating featured post. Lists without those flags
 * (Recent, profiles) keep showing the pin as before.
 */

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
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/republic",
  useSearchParams: () => new URLSearchParams(),
}));

const makePost = (extra: Partial<FeedPost>): FeedPost =>
  ({
    id: "p1",
    authorId: "author",
    type: "citizen_experience",
    tab: "community",
    content: "Trail run recap",
    mediaUrls: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isPinned: false,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    author: { id: "author", name: "Ada" },
    ...extra,
  }) as unknown as FeedPost;

const renderCard = (extra: Partial<FeedPost>) =>
  render(<PostCard post={makePost(extra)} onOpenDetail={() => {}} />);

beforeEach(() => {
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
});

describe("PostCard For you labels", () => {
  it('labels a resurfaced post "From earlier"', () => {
    renderCard({ resurfaced: true });
    expect(screen.getByText("From earlier")).toBeInTheDocument();
  });

  it("shows no label on an ordinary post", () => {
    renderCard({ resurfaced: false });
    expect(screen.queryByText("From earlier")).not.toBeInTheDocument();
    expect(screen.queryByText("Featured in Republic")).not.toBeInTheDocument();
  });

  it("shows Featured on the session's featured post", () => {
    renderCard({ isPinned: true, isFeatured: true });
    expect(screen.getByText("Featured in Republic")).toBeInTheDocument();
  });

  it("doesn't show Featured on a pinned post For you didn't feature", () => {
    renderCard({ isPinned: true, isFeatured: false });
    expect(screen.queryByText("Featured in Republic")).not.toBeInTheDocument();
  });

  it("keeps the pin's banner where For you flags are absent (Recent)", () => {
    renderCard({ isPinned: true });
    expect(screen.getByText("Featured in Republic")).toBeInTheDocument();
  });
});

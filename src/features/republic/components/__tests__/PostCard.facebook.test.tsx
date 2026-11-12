import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/** Share to Facebook Page appears in the Share menu only where it can work:
 * the viewer's own public post with a video. Copy link is always there. */

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

vi.mock("@/shared/api/facebook", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/facebook")>()),
  shareToFacebook: vi.fn(),
  getFacebookShare: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/republic",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, sizes: _sizes, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

const makePost = (over: Partial<FeedPost> = {}): FeedPost =>
  ({
    id: "p1",
    authorId: "me",
    type: "citizen_experience",
    tab: "all",
    content: "Sunset reel",
    mediaUrls: ["https://cdn.test/users/me/uploads/clip.mp4"],
    visibility: "public",
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isPinned: false,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    author: { id: "me", name: "Ada" },
    ...over,
  }) as unknown as FeedPost;

/** Opens the post's Share menu and looks for its Facebook item. */
const facebookButton = () => {
  fireEvent.click(screen.getByRole("button", { name: /^share$/i }));
  return screen.queryByRole("menuitem", { name: /share to facebook/i });
};

beforeEach(() => {
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
});

describe("PostCard Share to Facebook", () => {
  it("shows the action on the viewer's own public video post", () => {
    render(<PostCard post={makePost()} onOpenDetail={() => {}} />);
    expect(facebookButton()).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
    // The existing actions are all still there.
    expect(screen.getByText("Send")).toBeInTheDocument();
    expect(screen.getByText("Repost")).toBeInTheDocument();
  });

  it("hides it on someone else's post, where Share still copies the link", () => {
    render(
      <PostCard
        post={makePost({ authorId: "other", author: { id: "other", name: "Bo" } } as never)}
        onOpenDetail={() => {}}
      />,
    );
    expect(facebookButton()).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toBeInTheDocument();
  });

  it("hides it on a followers-only or only-me post", () => {
    render(
      <PostCard post={makePost({ visibility: "followers" })} onOpenDetail={() => {}} />,
    );
    expect(facebookButton()).not.toBeInTheDocument();
  });

  it("hides it on a post without a video", () => {
    render(
      <PostCard
        post={makePost({ mediaUrls: ["https://cdn.test/photo.jpg"] })}
        onOpenDetail={() => {}}
      />,
    );
    expect(facebookButton()).not.toBeInTheDocument();
  });

  it("hides it when signed out", () => {
    useAuthStore.setState({ user: null } as never);
    render(<PostCard post={makePost()} onOpenDetail={() => {}} />);
    expect(facebookButton()).not.toBeInTheDocument();
  });
});

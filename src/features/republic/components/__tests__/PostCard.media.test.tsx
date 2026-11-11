import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";

/** The feed gallery: one item keeps its own shape, 4+ items collapse to a
 * 2×2 grid with "+N" on the last tile, and the lightbox still reaches every item. */

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

vi.mock("next/image", () => ({
  default: ({ alt, fill: _fill, sizes: _sizes, ...props }: any) => (
    <img alt={alt ?? ""} {...props} />
  ),
}));

const makePost = (mediaUrls: string[]): FeedPost =>
  ({
    id: "p1",
    authorId: "author",
    type: "citizen_experience",
    tab: "all",
    content: "Gallery post",
    mediaUrls,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isPinned: false,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    author: { id: "author", name: "Ada" },
  }) as unknown as FeedPost;

const urls = (n: number) =>
  Array.from({ length: n }, (_, i) => `https://cdn.test/photo-${i + 1}.jpg`);

const galleryImages = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img")).filter((img) =>
    img.getAttribute("src")?.startsWith("https://cdn.test/"),
  );

beforeEach(() => {
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
});

describe("PostCard media gallery", () => {
  it("shows a single photo at its natural shape, not in a fixed-height cell", () => {
    const { container } = render(
      <PostCard post={makePost(urls(1))} onOpenDetail={() => {}} />,
    );
    const [img] = galleryImages(container);

    expect(img.className).toContain("h-auto");
    expect(img.className).toContain("object-contain");
    expect(img.parentElement!.className).not.toMatch(/\bh-40\b|aspect-/);
  });

  it("shows 4 tiles and +2 for a post with 6 photos", () => {
    const { container } = render(
      <PostCard post={makePost(urls(6))} onOpenDetail={() => {}} />,
    );

    expect(galleryImages(container)).toHaveLength(4);
    expect(screen.getByText("+2")).toBeTruthy();
  });

  it("shows no +N when a post has exactly 4 photos", () => {
    const { container } = render(
      <PostCard post={makePost(urls(4))} onOpenDetail={() => {}} />,
    );

    expect(galleryImages(container)).toHaveLength(4);
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("opens the lightbox from the +N tile without opening the post", () => {
    const onOpenDetail = vi.fn();
    render(<PostCard post={makePost(urls(6))} onOpenDetail={onOpenDetail} />);

    fireEvent.click(screen.getByText("+2"));

    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.getByLabelText("Go to photo 6")).toBeTruthy();
    expect(onOpenDetail).not.toHaveBeenCalled();
  });
});

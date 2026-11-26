import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { FeedPost } from "@/features/republic/types";
import { PostCard } from "../PostCard";
import { __resetFeedVideoAutoplay } from "@/features/republic/hooks/useFeedVideoAutoplay";

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

// The photos themselves, not the decorative blurred backdrop behind a single one.
const galleryImages = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img")).filter(
    (img) =>
      img.getAttribute("src")?.startsWith("https://cdn.test/") &&
      !img.hasAttribute("aria-hidden"),
  );
const backdrops = (container: HTMLElement) =>
  container.querySelectorAll(
    'img[aria-hidden="true"][src^="https://cdn.test/"]',
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

  it("fills the side bars of a single photo with a blurred copy of it", () => {
    const { container } = render(
      <PostCard post={makePost(urls(1))} onOpenDetail={() => {}} />,
    );
    const [backdrop] = backdrops(container);

    expect(backdrop.getAttribute("src")).toBe("https://cdn.test/photo-1.jpg");
    expect(backdrop.className).toContain("blur-2xl");
    expect(backdrop.className).toContain("object-cover");
    expect(galleryImages(container)).toHaveLength(1);
  });

  it("adds no blurred backdrop to a multi-photo grid", () => {
    const { container } = render(
      <PostCard post={makePost(urls(3))} onOpenDetail={() => {}} />,
    );
    expect(backdrops(container)).toHaveLength(0);
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

describe("PostCard videos in the Republic feed (app#385 follow-up)", () => {
  class FakeIO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const video = (n: number) => `https://cdn.test/clip-${n}.mp4`;
  const volumeButtons = () => screen.queryAllByRole("button", { name: /mute/i });

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeIO);
    __resetFeedVideoAutoplay();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("plays a single video by itself in the feed, with a volume button", async () => {
    render(
      <PostCard
        post={makePost([video(1)])}
        onOpenDetail={() => {}}
        autoplayVideos
      />,
    );
    expect(
      await screen.findByRole("button", { name: "Unmute" }),
    ).toBeTruthy();
  });

  it("stays a still frame where autoplay isn't asked for (saved, detail)", () => {
    render(<PostCard post={makePost([video(1)])} onOpenDetail={() => {}} />);
    expect(volumeButtons()).toHaveLength(0);
    expect(screen.getByTestId("video-play-badge")).toBeTruthy();
  });

  it("never autoplays inside the post detail", () => {
    render(
      <PostCard post={makePost([video(1)])} variant="modal" autoplayVideos />,
    );
    expect(volumeButtons()).toHaveLength(0);
  });

  it("plays only the first video tile of a multi-item post", async () => {
    const { container } = render(
      <PostCard
        post={makePost([urls(1)[0], video(1), video(2)])}
        onOpenDetail={() => {}}
        autoplayVideos
      />,
    );
    expect(await screen.findAllByRole("button", { name: "Unmute" })).toHaveLength(1);
    const tile = screen.getByRole("button", { name: "Unmute" }).parentElement!;
    expect(tile.querySelector("video")!.getAttribute("src")).toBe(video(1));
    expect(container.querySelectorAll("video")).toHaveLength(2);
  });

  it("doesn't play a video hidden under +N", () => {
    render(
      <PostCard
        post={makePost([...urls(3), video(1), video(2)])}
        onOpenDetail={() => {}}
        autoplayVideos
      />,
    );
    expect(volumeButtons()).toHaveLength(0);
  });

  it("opens the viewer when the video is tapped, but not from the volume button", async () => {
    const onOpenDetail = vi.fn();
    const { container } = render(
      <PostCard
        post={makePost([video(1)])}
        onOpenDetail={onOpenDetail}
        autoplayVideos
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Unmute" }));
    expect(screen.queryByLabelText("Close")).toBeNull();

    fireEvent.click(container.querySelector("video")!);
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(onOpenDetail).not.toHaveBeenCalled();
  });
});

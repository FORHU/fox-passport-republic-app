import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { PublicCitizenProfile } from "@/shared/api/citizen";
import PublicCitizenProfileView from "../PublicCitizenProfileView";

/**
 * A public passport profile opens on Republic Activity (the person's posts),
 * and that tab is the leftmost one (app#306). With no posts it shows the
 * empty state rather than falling back to another tab.
 */

const profile = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/shared/api/citizen", () => ({
  fetchPublicCitizenProfile: async () => profile.current,
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "u1" }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select?: (s: unknown) => unknown) => {
    const state = { user: { id: "viewer" } };
    return select ? select(state) : state;
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/image", () => ({
  default: ({
    alt,
    fill: _fill,
    sizes: _sizes,
    ...props
  }: Record<string, unknown>) =>
    createElement("img", { alt: alt ?? "", ...props }),
}));

function makeProfile(
  overrides: Partial<PublicCitizenProfile> = {},
): PublicCitizenProfile {
  return {
    id: "u1",
    name: "Ana",
    username: "ana",
    roleType: [],
    systemRole: "user",
    createdAt: "2025-01-01T00:00:00.000Z",
    passport: {
      id: "p1",
      perks: [],
      paths: [],
      stamps: [
        {
          id: "s1",
          venueId: null,
          venue: { name: "Fox Hall", city: "Manila" },
        },
      ],
      userBadges: [],
    },
    posts: [
      {
        id: "post1",
        type: "experience",
        content: "Loved the jazz night",
        createdAt: "2026-11-01T00:00:00.000Z",
        mediaUrls: [],
        likesCount: 2,
        commentsCount: 1,
      },
    ],
    ...overrides,
  } as unknown as PublicCitizenProfile;
}

function renderProfile() {
  return render(
    createElement(
      QueryClientProvider,
      {
        client: new QueryClient({
          defaultOptions: { queries: { retry: false } },
        }),
      },
      createElement(PublicCitizenProfileView),
    ),
  );
}

/** The tab strip is the row of buttons containing "Republic Activity". */
async function tabButtons() {
  const activity = await screen.findByRole("button", {
    name: /republic activity/i,
  });
  return within(activity.parentElement as HTMLElement).getAllByRole("button");
}

describe("PublicCitizenProfileView default tab", () => {
  beforeEach(() => {
    profile.current = makeProfile();
  });

  it("puts Republic Activity first, then Venue Stamps and Milestone Badges", async () => {
    renderProfile();
    const names = (await tabButtons()).map((b) => b.textContent ?? "");
    expect(names[0]).toMatch(/republic activity/i);
    expect(names[1]).toMatch(/venue stamps/i);
    expect(names[2]).toMatch(/milestone badges/i);
  });

  it("opens on Republic Activity and shows the person's posts", async () => {
    renderProfile();
    const [first] = await tabButtons();
    expect(first).toHaveClass("text-lime-400");
    expect(screen.getByText("Loved the jazz night")).toBeInTheDocument();
    expect(screen.queryByText("Fox Hall")).not.toBeInTheDocument();
  });

  it("shows the empty state when the person has no posts", async () => {
    profile.current = makeProfile({ posts: [] });
    renderProfile();
    expect(
      await screen.findByText("No Republic Posts Yet"),
    ).toBeInTheDocument();
  });

  it("still switches to Venue Stamps on click", async () => {
    renderProfile();
    fireEvent.click(
      await screen.findByRole("button", { name: /venue stamps/i }),
    );
    expect(screen.getByText("Fox Hall")).toBeInTheDocument();
    expect(screen.queryByText("Loved the jazz night")).not.toBeInTheDocument();
  });
});

/**
 * Republic Activity leads with media (app#307): image and video posts become
 * square tiles that open the post, and text-only posts stay as cards below.
 */
describe("PublicCitizenProfileView media grid", () => {
  const post = (id: string, content: string, mediaUrls: string[]) => ({
    id,
    type: "experience",
    content,
    createdAt: "2026-11-01T00:00:00.000Z",
    mediaUrls,
    likesCount: 3,
    commentsCount: 1,
  });

  function renderWithPosts(posts: ReturnType<typeof post>[]) {
    profile.current = makeProfile({
      posts: posts as unknown as PublicCitizenProfile["posts"],
    });
    return renderProfile();
  }

  it("shows an image post as a tile button, not a broken thumbnail", async () => {
    const { container } = renderWithPosts([
      post("img1", "Sunset at the venue", ["https://cdn.test/photo.jpg"]),
    ]);

    const tile = await screen.findByRole("button", {
      name: /open post: sunset at the venue · 3 likes · 1 comment/i,
    });
    expect(tile).not.toHaveAttribute("href");
    expect(tile.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/photo.jpg",
    );
    expect(container.querySelector('img[alt="Media"]')).toBeNull();
  });

  it("shows a video post as a <video> preview with a play icon", async () => {
    renderWithPosts([
      post("vid1", "test video", ["https://cdn.test/uploads/clip.mp4"]),
    ]);

    const tile = await screen.findByRole("button", {
      name: /open post: test video/i,
    });
    const video = tile.querySelector("video");
    expect(video).toHaveAttribute("src", "https://cdn.test/uploads/clip.mp4");
    expect(video).toHaveProperty("muted", true);
    expect(tile.querySelector("img")).toBeNull();
    expect(within(tile).getByTestId("video-icon")).toBeInTheDocument();
  });

  it("shows no play icon on an image tile", async () => {
    renderWithPosts([post("img1", "Photo", ["https://cdn.test/photo.jpg"])]);

    const tile = await screen.findByRole("button", {
      name: /open post: photo/i,
    });
    expect(within(tile).queryByTestId("video-icon")).toBeNull();
  });

  it("marks a post with several media items", async () => {
    renderWithPosts([
      post("multi", "Gallery", [
        "https://cdn.test/a.jpg",
        "https://cdn.test/b.jpg",
      ]),
      post("one", "Single", ["https://cdn.test/c.jpg"]),
    ]);

    const multi = await screen.findByRole("button", {
      name: /open post: gallery/i,
    });
    const single = screen.getByRole("button", { name: /open post: single/i });
    expect(
      within(multi).getByTestId("multiple-media-icon"),
    ).toBeInTheDocument();
    expect(within(single).queryByTestId("multiple-media-icon")).toBeNull();
    // Only the first item shows on the tile.
    expect(multi.querySelectorAll("img")).toHaveLength(1);
  });

  it("keeps text-only posts readable below the media tiles", async () => {
    renderWithPosts([
      post("img1", "Photo post", ["https://cdn.test/photo.jpg"]),
      post("txt1", "Just words, no media", []),
    ]);

    expect(await screen.findByText("Just words, no media")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view in feed/i })).toHaveAttribute(
      "href",
      "/republic?postId=txt1",
    );
    // The media post is a tile, not a text card.
    expect(screen.queryByText("Photo post")).toBeNull();
  });
});

/**
 * A tile opens the post in a viewer on the profile itself (no redirect to
 * the feed): media on top, description and counts below, ◀ ▶ between posts.
 */
describe("PublicCitizenProfileView post viewer", () => {
  const post = (
    id: string,
    content: string,
    mediaUrls: string[],
    likesCount = 3,
    commentsCount = 1,
  ) => ({
    id,
    type: "experience",
    content,
    createdAt: "2026-11-01T00:00:00.000Z",
    mediaUrls,
    likesCount,
    commentsCount,
  });

  const posts = [
    post("p1", "First post", ["https://cdn.test/one.jpg"], 5, 2),
    post("p2", "Second post", ["https://cdn.test/two.mp4"], 7, 4),
    post("p3", "Third post", [
      "https://cdn.test/a.jpg",
      "https://cdn.test/b.jpg",
    ]),
  ];

  async function openTile(name: RegExp) {
    profile.current = makeProfile({
      posts: posts as unknown as PublicCitizenProfile["posts"],
    });
    renderProfile();
    fireEvent.click(await screen.findByRole("button", { name }));
    return screen.getByRole("dialog");
  }

  it("opens the post in place with its description and counts below", async () => {
    const dialog = await openTile(/open post: first post/i);

    expect(within(dialog).getByText("First post")).toBeInTheDocument();
    expect(within(dialog).getByTestId("viewer-likes")).toHaveTextContent("5");
    expect(within(dialog).getByTestId("viewer-comments")).toHaveTextContent(
      "2",
    );
    expect(dialog.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/one.jpg",
    );
    // Opening the viewer is not a navigation.
    expect(dialog.querySelector("a")).toBeNull();
  });

  it("steps between posts with the icon-only arrow buttons", async () => {
    const dialog = await openTile(/open post: first post/i);

    expect(
      within(dialog).queryByRole("button", { name: "Previous post" }),
    ).toBeNull();
    const next = within(dialog).getByRole("button", { name: "Next post" });
    expect(next).not.toHaveTextContent(/next/i);

    fireEvent.click(next);
    expect(within(dialog).getByText("Second post")).toBeInTheDocument();
    expect(within(dialog).getByTestId("viewer-likes")).toHaveTextContent("7");

    fireEvent.click(within(dialog).getByRole("button", { name: "Next post" }));
    expect(within(dialog).getByText("Third post")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Next post" }),
    ).toBeNull();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Previous post" }),
    );
    expect(within(dialog).getByText("Second post")).toBeInTheDocument();
  });

  it("moves with the arrow keys and closes on Escape", async () => {
    const dialog = await openTile(/open post: first post/i);

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(within(dialog).getByText("Second post")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(within(dialog).getByText("First post")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes from the close button", async () => {
    const dialog = await openTile(/open post: first post/i);
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("plays a video post with controls", async () => {
    const dialog = await openTile(/open post: second post/i);
    const video = dialog.querySelector("video");
    expect(video).toHaveAttribute("src", "https://cdn.test/two.mp4");
    expect(video).toHaveAttribute("controls");
  });

  it("flips through a post's own items with the dots", async () => {
    const dialog = await openTile(/open post: third post/i);

    expect(dialog.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/a.jpg",
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Show item 2" }),
    );
    expect(dialog.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/b.jpg",
    );
  });
});

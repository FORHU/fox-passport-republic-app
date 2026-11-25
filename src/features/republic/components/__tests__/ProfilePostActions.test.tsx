import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { SOCKET_EVENTS, publishRealtime } from "@/shared/lib/realtime";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { usePostStatsStore } from "@/features/republic/store/usePostStatsStore";
import type { PostComment } from "@/features/republic/types";
import { LivePostCount, ProfilePostActions } from "../ProfilePostActions";

/**
 * api#427: a profile's Republic Activity lets the visitor react, comment,
 * reply and react to comments without leaving the profile, and the counts
 * stay in step with the feed through the shared stats store.
 */

const api = vi.hoisted(() => ({
  setPostReaction: vi.fn(),
  setCommentReaction: vi.fn(),
  getPostComments: vi.fn(),
  addPostComment: vi.fn(),
}));

vi.mock("@/shared/api/feed", () => ({
  ...api,
  editPostComment: vi.fn(),
  deletePostComment: vi.fn(),
  searchMentionCandidates: vi.fn().mockResolvedValue([]),
}));

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const post = {
  id: "p1",
  likesCount: 2,
  commentsCount: 1,
  myReaction: null,
  isLikedByMe: false,
};

const comment = (id: string, over: Partial<PostComment> = {}) =>
  ({
    id,
    postId: "p1",
    authorId: "ada",
    content: `comment ${id}`,
    likesCount: 0,
    isLikedByMe: false,
    myReaction: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    author: { id: "ada", name: "Ada" },
    replies: [],
    ...over,
  }) as unknown as PostComment;

const renderActions = () =>
  render(
    <>
      <ProfilePostActions post={post}>
        <a href="/republic?postId=p1">View in Feed →</a>
      </ProfilePostActions>
      <span data-testid="tile-likes">
        <LivePostCount post={post} kind="likes" />
      </span>
    </>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  usePostStatsStore.getState().reset();
  useAuthStore.setState({ user: { id: "me", userId: "me" } as never });
  api.getPostComments.mockResolvedValue([comment("c1")]);
});

describe("ProfilePostActions", () => {
  it("reacts to the post and updates every count showing it", async () => {
    api.setPostReaction.mockResolvedValue({ reaction: "like", likesCount: 3 });
    renderActions();

    fireEvent.click(screen.getByRole("button", { name: /like/i }));

    await waitFor(() =>
      expect(api.setPostReaction).toHaveBeenCalledWith("p1", "like"),
    );
    expect(screen.getByTestId("tile-likes")).toHaveTextContent("3");
  });

  it("picks any of the six reactions from the picker", async () => {
    api.setPostReaction.mockResolvedValue({ reaction: "haha", likesCount: 3 });
    const { container } = renderActions();

    fireEvent.mouseEnter(container.querySelector(".relative")!);
    fireEvent.click(screen.getByTitle("Haha"));

    await waitFor(() =>
      expect(api.setPostReaction).toHaveBeenCalledWith("p1", "haha"),
    );
  });

  it("asks a signed-out visitor to sign in instead of reacting", () => {
    const openLogin = vi.fn();
    useAuthStore.setState({ user: null, openLogin } as never);
    renderActions();

    fireEvent.click(screen.getByRole("button", { name: /like/i }));

    expect(openLogin).toHaveBeenCalled();
    expect(api.setPostReaction).not.toHaveBeenCalled();
  });

  it("keeps the trailing link in the action row", () => {
    renderActions();
    expect(screen.getByRole("link", { name: /view in feed/i })).toHaveAttribute(
      "href",
      "/republic?postId=p1",
    );
  });

  it("opens the comments inside the card, and closes them again", async () => {
    renderActions();
    const toggle = screen.getByRole("button", { name: /show comments/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(await screen.findByText("comment c1")).toBeInTheDocument();
    expect(api.getPostComments).toHaveBeenCalledWith("p1");

    fireEvent.click(screen.getByRole("button", { name: /hide comments/i }));
    expect(screen.queryByText("comment c1")).toBeNull();
  });

  it("reacts to a reply with any of the six reactions", async () => {
    api.getPostComments.mockResolvedValue([
      comment("c1", { replies: [comment("r1", { parentId: "c1" })] }),
    ]);
    api.setCommentReaction.mockResolvedValue({
      reaction: "love",
      likesCount: 1,
    });
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: /show comments/i }));

    const reply = (await screen.findByText("comment r1")).closest(
      "[id]",
    ) as HTMLElement;
    const reactRow = within(reply)
      .getByRole("button", { name: /like/i })
      .closest("div.relative")!;
    fireEvent.mouseEnter(reactRow);
    fireEvent.click(within(reply).getByTitle("Love"));

    await waitFor(() =>
      expect(api.setCommentReaction).toHaveBeenCalledWith("p1", "r1", "love"),
    );
    expect(within(reply).getByText("❤️")).toBeInTheDocument();
    expect(within(reply).getByText("1")).toBeInTheDocument();
  });
});

/** Other viewers' activity arrives over the socket; SocketProvider hands it
 * to publishRealtime, which these tests call directly. */
describe("ProfilePostActions live updates (api#427)", () => {
  const push = (event: string, payload: unknown) =>
    act(() => publishRealtime(event, payload));

  it("shows someone else's reaction on the post count", () => {
    renderActions();
    push(SOCKET_EVENTS.POST_REACTIONS_COUNT, { postId: "p1", likesCount: 9 });
    expect(screen.getByTestId("tile-likes")).toHaveTextContent("9");
  });

  it("ignores counts for other posts", () => {
    renderActions();
    push(SOCKET_EVENTS.POST_REACTIONS_COUNT, { postId: "p2", likesCount: 9 });
    expect(screen.getByTestId("tile-likes")).toHaveTextContent("2");
  });

  it("stops listening once nothing shows a post", () => {
    const view = renderActions();
    view.unmount();
    push(SOCKET_EVENTS.POST_REACTIONS_COUNT, { postId: "p1", likesCount: 9 });
    renderActions();
    // Re-seeded from the post, not left at the pushed number.
    expect(screen.getByTestId("tile-likes")).not.toHaveTextContent("9");
  });

  it("patches a comment's reaction count in place", async () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: /show comments/i }));
    const row = (await screen.findByText("comment c1")).closest(
      "[id]",
    ) as HTMLElement;

    push(SOCKET_EVENTS.COMMENT_REACTIONS_COUNT, {
      postId: "p1",
      commentId: "c1",
      likesCount: 4,
    });

    expect(within(row).getByText("4")).toBeInTheDocument();
  });

  it("loads someone else's new comment into the open list", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderActions();
      fireEvent.click(screen.getByRole("button", { name: /show comments/i }));
      await screen.findByText("comment c1");
      api.getPostComments.mockResolvedValue([comment("c1"), comment("c2")]);

      push(SOCKET_EVENTS.POST_COMMENTS_COUNT, { postId: "p1", commentsCount: 2 });
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(await screen.findByText("comment c2")).toBeInTheDocument();
      expect(api.getPostComments).toHaveBeenLastCalledWith("p1", { limit: 50 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("doesn't refetch when the count already matches what is shown", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderActions();
      fireEvent.click(screen.getByRole("button", { name: /show comments/i }));
      await screen.findByText("comment c1");
      api.getPostComments.mockClear();

      push(SOCKET_EVENTS.POST_COMMENTS_COUNT, { postId: "p1", commentsCount: 1 });
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(api.getPostComments).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("ProfilePostActions after a profile refetch", () => {
  it("takes fresher counts from a newer request", () => {
    const { rerender } = render(
      <ProfilePostActions post={post} requestedAt={1_000} />,
    );
    rerender(
      <ProfilePostActions
        post={{ ...post, likesCount: 6, commentsCount: 3 }}
        requestedAt={2_000}
      />,
    );
    expect(usePostStatsStore.getState().stats.p1).toMatchObject({
      likesCount: 6,
      commentsCount: 3,
    });
  });

  it("keeps a reaction made after that request started", async () => {
    api.setPostReaction.mockResolvedValue({ reaction: "like", likesCount: 3 });
    const { rerender } = render(
      <ProfilePostActions post={post} requestedAt={Date.now() - 10_000} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /like/i }));
    await waitFor(() => expect(api.setPostReaction).toHaveBeenCalled());
    await waitFor(() =>
      expect(usePostStatsStore.getState().pending.p1).toBeUndefined(),
    );

    // A response to a request that started before the reaction.
    rerender(
      <ProfilePostActions
        post={{ ...post, likesCount: 2, myReaction: null }}
        requestedAt={Date.now() - 5_000}
      />,
    );
    expect(usePostStatsStore.getState().stats.p1).toMatchObject({
      likesCount: 3,
      myReaction: "like",
    });
  });
});

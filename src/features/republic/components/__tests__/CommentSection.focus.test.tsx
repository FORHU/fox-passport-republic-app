import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import type { PostComment } from "@/features/republic/types";
import { CommentSection, commentElementId } from "../CommentSection";

/**
 * api#451: opened from a notification, the comment list finds the comment or
 * reply (loading more pages if needed), scrolls to it and highlights it.
 */

const api = vi.hoisted(() => ({
  getPostComments: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock("@/shared/api/feed", () => ({
  getPostComments: api.getPostComments,
  addPostComment: vi.fn(),
  editPostComment: vi.fn(),
  deletePostComment: vi.fn(),
  searchMentionCandidates: vi.fn().mockResolvedValue([]),
  toggleCommentLike: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { info: api.toastInfo, error: vi.fn(), success: vi.fn() },
}));

const comment = (id: string, replies: PostComment[] = []) =>
  ({
    id,
    postId: "p1",
    authorId: "a1",
    content: `comment ${id}`,
    createdAt: "2026-11-24T00:00:00.000Z",
    updatedAt: "2026-11-24T00:00:00.000Z",
    likesCount: 0,
    isLikedByMe: false,
    author: { id: "a1", name: "Ada" },
    replies,
  }) as unknown as PostComment;

const scrollIntoView = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = scrollIntoView;
});

describe("CommentSection focus", () => {
  it("scrolls to and highlights a comment on the first page", async () => {
    api.getPostComments.mockResolvedValue([comment("c1"), comment("c2")]);

    const { container } = render(
      <CommentSection postId="p1" commentsCount={2} focusCommentId="c2" />,
    );

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    const row = container.querySelector(`#${commentElementId("c2")}`);
    expect(row).toHaveAttribute("data-highlighted", "true");
    expect(
      container.querySelector(`#${commentElementId("c1")}`),
    ).not.toHaveAttribute("data-highlighted");
    expect(api.getPostComments).toHaveBeenCalledTimes(1);
  });

  it("finds a reply nested under its parent", async () => {
    api.getPostComments.mockResolvedValue([comment("c1", [comment("r1")])]);

    const { container } = render(
      <CommentSection postId="p1" commentsCount={2} focusCommentId="r1" />,
    );

    await waitFor(() =>
      expect(
        container.querySelector(`#${commentElementId("r1")}`),
      ).toHaveAttribute("data-highlighted", "true"),
    );
  });

  it("loads later pages until it finds the comment", async () => {
    const firstPage = Array.from({ length: 50 }, (_, i) => comment(`a${i}`));
    api.getPostComments
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([comment("late")]);

    const { container } = render(
      <CommentSection postId="p1" commentsCount={51} focusCommentId="late" />,
    );

    await waitFor(() =>
      expect(
        container.querySelector(`#${commentElementId("late")}`),
      ).toHaveAttribute("data-highlighted", "true"),
    );
    expect(api.getPostComments).toHaveBeenLastCalledWith("p1", {
      limit: 50,
      cursor: "a49",
    });
  });

  it("says when the comment is gone and keeps the post's comments", async () => {
    api.getPostComments.mockResolvedValue([comment("c1")]);

    const { findByText } = render(
      <CommentSection postId="p1" commentsCount={1} focusCommentId="gone" />,
    );

    expect(await findByText("comment c1")).toBeInTheDocument();
    expect(api.toastInfo).toHaveBeenCalledWith(
      "That comment is no longer available.",
    );
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("loads one page and highlights nothing without a target", async () => {
    api.getPostComments.mockResolvedValue([comment("c1")]);

    const { findByText, container } = render(
      <CommentSection postId="p1" commentsCount={1} />,
    );

    expect(await findByText("comment c1")).toBeInTheDocument();
    expect(api.getPostComments).toHaveBeenCalledWith("p1");
    expect(container.querySelector("[data-highlighted]")).toBeNull();
    expect(api.toastInfo).not.toHaveBeenCalled();
  });
});

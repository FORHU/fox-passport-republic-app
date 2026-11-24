import { describe, it, expect } from "vitest";
import type { Notification } from "@/shared/types/notification";
import { getNotificationLink } from "../notificationLink";

/** api#451: a Republic notification opens its post, at its comment or reply. */

const n = (over: Partial<Notification>): Notification => ({
  id: "n1",
  userId: "u1",
  type: "feed:comment",
  title: "t",
  message: "m",
  isRead: false,
  metadata: null,
  createdAt: "2026-11-24T00:00:00.000Z",
  ...over,
});

describe("getNotificationLink", () => {
  it("opens the post for a post notification", () => {
    expect(
      getNotificationLink(
        n({
          type: "feed:like",
          target: {
            type: "post",
            postId: "p1",
            commentId: null,
            parentCommentId: null,
            available: true,
          },
        }),
      ),
    ).toEqual({ href: "/republic?postId=p1", unavailable: false });
  });

  it("opens the post at the comment for a comment or reply", () => {
    expect(
      getNotificationLink(
        n({
          type: "feed:reply",
          target: {
            type: "reply",
            postId: "p1",
            commentId: "r1",
            parentCommentId: "c1",
            available: true,
          },
        }),
      ).href,
    ).toBe("/republic?postId=p1&commentId=r1");
  });

  it("reports a deleted post as unavailable instead of linking it", () => {
    expect(
      getNotificationLink(
        n({
          type: "feed:like",
          target: {
            type: "post",
            postId: "gone",
            commentId: null,
            parentCommentId: null,
            available: false,
          },
        }),
      ),
    ).toEqual({ href: null, unavailable: true });
  });

  it("still links an unavailable comment, so the post can be the fallback", () => {
    expect(
      getNotificationLink(
        n({
          target: {
            type: "comment",
            postId: "p1",
            commentId: "gone",
            parentCommentId: null,
            available: false,
          },
        }),
      ),
    ).toEqual({
      href: "/republic?postId=p1&commentId=gone",
      unavailable: false,
    });
  });

  it("keeps an explicit metadata.link ahead of the target", () => {
    expect(
      getNotificationLink(
        n({ type: "BOOKING_CONFIRMED", metadata: { link: "/booking/b1" } }),
      ).href,
    ).toBe("/booking/b1");
  });

  it("falls back to metadata ids when the API sent no target", () => {
    expect(
      getNotificationLink(n({ metadata: { postId: "p1", commentId: "c1" } }))
        .href,
    ).toBe("/republic?postId=p1&commentId=c1");
  });

  it("leads nowhere for a non-feed notification without a link", () => {
    expect(
      getNotificationLink(n({ type: "role_request_approved", target: null })),
    ).toEqual({ href: null, unavailable: false });
  });

  it("leads nowhere for a feed notification with no post to open", () => {
    expect(
      getNotificationLink(n({ type: "feed:comment_like", target: null })),
    ).toEqual({ href: null, unavailable: false });
  });
});

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

  describe("links stored before app#383, which named no page here", () => {
    const link = (path: string, type = "BOOKING_CONFIRMED") =>
      getNotificationLink(n({ type, metadata: { link: path } }));

    it("sends /bookings/:id to the booking page", () => {
      expect(link("/bookings/b1")).toEqual({
        href: "/booking/b1",
        unavailable: false,
      });
    });

    it("sends /host/bookings/:id to the booking page", () => {
      expect(link("/host/bookings/b1").href).toBe("/booking/b1");
    });

    it("keeps a query or hash on the repaired booking link", () => {
      expect(link("/bookings/b1?tab=tickets#top").href).toBe(
        "/booking/b1?tab=tickets#top",
      );
    });

    it("sends /partnerships/:id to the partnerships dashboard", () => {
      expect(link("/partnerships/p1", "sponsorship_cancelled").href).toBe(
        "/creator-dashboard/partnerships",
      );
    });

    it("leads nowhere for /invoices/:id, which has no page", () => {
      expect(link("/invoices/i1", "refund_succeeded")).toEqual({
        href: null,
        unavailable: false,
      });
    });

    it("does not touch links that already resolve", () => {
      expect(link("/booking/b1").href).toBe("/booking/b1");
      expect(link("/booking/fulfillment/asset/a1").href).toBe(
        "/booking/fulfillment/asset/a1",
      );
      expect(link("/booking").href).toBe("/booking");
      expect(link("/creator-dashboard/partnerships").href).toBe(
        "/creator-dashboard/partnerships",
      );
      expect(link("/messages?userId=u1").href).toBe("/messages?userId=u1");
    });

    it("does not rewrite a path that only starts like a legacy one", () => {
      expect(link("/bookings-archive/b1").href).toBe("/bookings-archive/b1");
    });
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

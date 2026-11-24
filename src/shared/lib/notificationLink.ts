import type { Notification } from "@/shared/types/notification";

export interface NotificationLink {
  /** Where clicking the notification goes; null when it leads nowhere. */
  href: string | null;
  /** The post it points at was deleted, so there is nothing to open. */
  unavailable: boolean;
}

const nowhere: NotificationLink = { href: null, unavailable: false };

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** `/republic?postId=…[&commentId=…]`, the post's detail modal on the feed. */
export function republicPostHref(postId: string, commentId?: string | null) {
  const params = new URLSearchParams({ postId });
  if (commentId) params.set("commentId", commentId);
  return `/republic?${params.toString()}`;
}

/**
 * Where a notification leads when clicked. An explicit `metadata.link` (set by
 * booking, application and other notifications) wins. A Republic notification
 * opens its post, scrolled to the comment or reply it is about, from the API's
 * `target`, or from `metadata` when `target` is missing (an older API).
 *
 * A deleted post is reported as `unavailable` instead of linked. When a
 * comment is involved the API can't say which of the two is gone, so the link
 * is kept: the Republic page explains if the post or the comment is missing.
 */
export function getNotificationLink(n: Notification): NotificationLink {
  const link = str(n.metadata?.link);
  if (link) return { href: link, unavailable: false };

  if (n.target) {
    const { postId, commentId, available } = n.target;
    if (!available && !commentId) return { href: null, unavailable: true };
    return { href: republicPostHref(postId, commentId), unavailable: false };
  }

  if (n.target === undefined && n.type.startsWith("feed:")) {
    const postId = str(n.metadata?.postId);
    if (!postId) return nowhere;
    return {
      href: republicPostHref(postId, str(n.metadata?.commentId)),
      unavailable: false,
    };
  }

  return nowhere;
}

export const UNAVAILABLE_POST_MESSAGE = "This post is no longer available.";
export const UNAVAILABLE_COMMENT_MESSAGE =
  "That comment is no longer available.";

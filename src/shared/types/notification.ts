/**
 * Where a Republic (`feed:*`) notification leads, computed by the API on
 * every list item and socket push (api#450). `available` is false once the
 * post, or the comment, has been deleted.
 */
export interface NotificationTarget {
  type: "post" | "comment" | "reply";
  postId: string;
  /** The comment or reply itself; null when the notification is about the post. */
  commentId: string | null;
  /** The top-level comment a reply answers; null unless `type` is "reply". */
  parentCommentId: string | null;
  available: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  /** Null for non-Republic notifications; absent from an older API. */
  target?: NotificationTarget | null;
  createdAt: string;
}

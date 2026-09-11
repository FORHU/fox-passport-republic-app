export interface ConversationParticipant {
  id: string;
  name: string;
  imgId: string | null;
}

export type ConversationStatus = "pending" | "accepted";

export interface Conversation {
  id: string;
  isGroup: boolean;
  /** 1:1 only — null for a group. */
  otherUser: ConversationParticipant | null;
  /** Group only — explicit name, or a comma-joined member list when unnamed. */
  name?: string;
  /** Group only — the other members (excludes the current user). */
  participants?: ConversationParticipant[];
  /** Group only — only the creator can remove other members. */
  creatorId?: string;
  /** Group only — a CloudFront URL, null shows the generic group icon. */
  imgId?: string | null;
  contextType: string | null;
  contextLabel: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
  status: ConversationStatus;
  /** Only meaningful while `status` is "pending" — true when this user is
   * the one being asked (someone else sent the request), false when this
   * user is the one waiting (they sent it). */
  isIncomingRequest: boolean;
  /** Null when the conversation exists but nobody has sent a message yet
   * (e.g. it was created just from the relationship, or on a stale request). */
  lastMessage: { content: string; isMine: boolean } | null;
  /** Personal, not shared — muting/pinning is per-viewer. */
  isMuted: boolean;
  isPinned: boolean;
  pinnedAt: string | null;
}

export interface SharedPostPreview {
  id: string;
  type: string;
  content: string;
  mediaUrls: string[];
  author: ConversationParticipant;
}

export interface ReplyToPreview {
  id: string;
  senderId: string;
  content: string;
  attachmentUrls: string[];
}

export interface MessageReactionEntry {
  userId: string;
  emoji: string;
}

export type MessageType = "text" | "system";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sharedPost?: SharedPostPreview | null;
  attachmentUrls?: string[];
  replyTo?: ReplyToPreview | null;
  isForwarded?: boolean;
  reactions?: MessageReactionEntry[];
  /** "system" is a group-membership notice ("X left the group") — rendered
   * as a centered notice instead of a bubble, see ChatPanel. */
  type?: MessageType;
  /** Set on edit — null/undefined means never edited. */
  editedAt?: string | null;
}

export interface Presence {
  online: boolean;
  lastActiveAt: string | null;
}

export interface ReadReceipt {
  userId: string;
  lastReadAt: string;
}

export interface StartConversationInput {
  otherUserId: string;
  contextType?: string;
  contextId?: string;
  contextLabel?: string;
}

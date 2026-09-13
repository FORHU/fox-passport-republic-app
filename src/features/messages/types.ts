export interface ConversationParticipant {
  id: string;
  name: string;
  imgId: string | null;
}

/**
 * Someone eligible to start a conversation with, add to a group, or forward
 * a message/post to — the shape every "send to" picker in this feature needs.
 * Same shape as `ConversationParticipant`, named separately because the two
 * meanings (an existing conversation's participant vs. a followed user who
 * could become one) are conceptually distinct even though the data lines up.
 * Was independently redeclared in four components with drifting `imgId`
 * optionality; this is the one place it should be defined now.
 */
export type Candidate = ConversationParticipant;

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

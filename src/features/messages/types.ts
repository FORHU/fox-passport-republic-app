export interface ConversationParticipant {
  id: string;
  name: string;
  imgId: string | null;
}

export interface Conversation {
  id: string;
  otherUser: ConversationParticipant;
  contextType: string | null;
  contextLabel: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface StartConversationInput {
  otherUserId: string;
  contextType?: string;
  contextId?: string;
  contextLabel?: string;
}

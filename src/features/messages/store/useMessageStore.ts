import { create } from "zustand";
import { Message, MessageReactionEntry } from "../types";

interface MessageState {
  messagesByConversation: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setMessageReactions: (
    conversationId: string,
    messageId: string,
    reactions: MessageReactionEntry[],
  ) => void;
}

// Mirrors useNotificationStore: REST fetches and socket pushes both funnel
// through this store so the UI reads from one source of truth regardless of
// where a message came from.
export const useMessageStore = create<MessageState>((set) => ({
  messagesByConversation: {},

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  addMessage: (message) =>
    set((state) => {
      const existing =
        state.messagesByConversation[message.conversationId] ?? [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, message],
        },
      };
    }),

  // Replaces an existing message by id in place — used for edits, unlike
  // addMessage's "no-op if already present" (which exists to guard against
  // a double-delivered new_message, not to update one already there).
  updateMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId];
      if (!existing) return state;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: existing.map((m) =>
            m.id === message.id ? message : m,
          ),
        },
      };
    }),

  removeMessage: (conversationId, messageId) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing) return state;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.filter((m) => m.id !== messageId),
        },
      };
    }),

  setMessageReactions: (conversationId, messageId, reactions) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing) return state;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((m) =>
            m.id === messageId ? { ...m, reactions } : m,
          ),
        },
      };
    }),
}));

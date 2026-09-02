import { create } from "zustand";
import { Message } from "../types";

interface MessageState {
  messagesByConversation: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
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
}));

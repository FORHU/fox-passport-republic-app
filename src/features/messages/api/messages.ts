import api from "@/shared/lib/axios";
import { Conversation, Message, StartConversationInput } from "../types";

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await api.get("/conversations");
  return res.data.data ?? [];
};

export const startConversation = async (
  input: StartConversationInput,
): Promise<{ id: string }> => {
  const res = await api.post("/conversations", input);
  return res.data.data;
};

export const getMessages = async (
  conversationId: string,
): Promise<Message[]> => {
  const res = await api.get(`/conversations/${conversationId}/messages`);
  return res.data.data ?? [];
};

export const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<Message> => {
  const res = await api.post(`/conversations/${conversationId}/messages`, {
    content,
  });
  return res.data.data;
};

export const markMessagesRead = async (
  conversationId: string,
): Promise<void> => {
  await api.patch(`/conversations/${conversationId}/read`);
};

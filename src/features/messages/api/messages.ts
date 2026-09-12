import api from "@/shared/lib/axios";
import {
  Conversation,
  Message,
  MessageReactionEntry,
  Presence,
  ReadReceipt,
  StartConversationInput,
} from "../types";

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

export const acceptConversationRequest = async (
  conversationId: string,
): Promise<{ status: "accepted" }> => {
  const res = await api.post(`/conversations/${conversationId}/accept`);
  return res.data.data;
};

export const declineConversationRequest = async (
  conversationId: string,
): Promise<{ status: "declined" }> => {
  const res = await api.post(`/conversations/${conversationId}/decline`);
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
  sharedPostId?: string,
  attachmentUrls?: string[],
  replyToId?: string,
  isForwarded?: boolean,
): Promise<Message> => {
  const res = await api.post(`/conversations/${conversationId}/messages`, {
    content,
    sharedPostId,
    attachmentUrls,
    replyToId,
    isForwarded,
  });
  return res.data.data;
};

// Reuses the same direct-upload endpoint ComposePostBox uses for post
// photos — one file, returns its public URL.
export const uploadMessageAttachment = async (
  file: File,
  signal?: AbortSignal,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/files/upload-direct", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return res.data.file?.url || res.data.url;
};

export const deleteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}`);
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/messages/${messageId}`);
};

export const markMessagesRead = async (
  conversationId: string,
): Promise<void> => {
  await api.patch(`/conversations/${conversationId}/read`);
};

export const reactToMessage = async (
  conversationId: string,
  messageId: string,
  emoji: string | null,
): Promise<{ reactions: MessageReactionEntry[] }> => {
  const res = await api.post(
    `/conversations/${conversationId}/messages/${messageId}/reaction`,
    { emoji },
  );
  return res.data.data;
};

export const getUserPresence = async (userId: string): Promise<Presence> => {
  const res = await api.get(`/users/${userId}/presence`);
  return res.data.data;
};

export const createGroupConversation = async (
  participantIds: string[],
  name?: string,
): Promise<Conversation> => {
  const res = await api.post("/conversations/group", { participantIds, name });
  return res.data.data;
};

export const addGroupParticipants = async (
  conversationId: string,
  userIds: string[],
): Promise<Conversation> => {
  const res = await api.post(`/conversations/${conversationId}/participants`, {
    userIds,
  });
  return res.data.data;
};

export const leaveGroupConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/participants/me`);
};

export const removeGroupMember = async (
  conversationId: string,
  userId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/participants/${userId}`);
};

export const renameGroupConversation = async (
  conversationId: string,
  name: string | null,
): Promise<Conversation> => {
  const res = await api.patch(`/conversations/${conversationId}/name`, {
    name,
  });
  return res.data.data;
};

export const setGroupPhoto = async (
  conversationId: string,
  imgId: string | null,
): Promise<Conversation> => {
  const res = await api.patch(`/conversations/${conversationId}/photo`, {
    imgId,
  });
  return res.data.data;
};

export const editMessage = async (
  conversationId: string,
  messageId: string,
  content: string,
): Promise<Message> => {
  const res = await api.patch(
    `/conversations/${conversationId}/messages/${messageId}`,
    { content },
  );
  return res.data.data;
};

export const getReadReceipts = async (
  conversationId: string,
): Promise<ReadReceipt[]> => {
  const res = await api.get(`/conversations/${conversationId}/read-receipts`);
  return res.data.data ?? [];
};

export const setConversationMuted = async (
  conversationId: string,
  muted: boolean,
): Promise<Conversation> => {
  const res = await api.patch(`/conversations/${conversationId}/mute`, {
    muted,
  });
  return res.data.data;
};

export const setConversationPinned = async (
  conversationId: string,
  pinned: boolean,
): Promise<Conversation> => {
  const res = await api.patch(`/conversations/${conversationId}/pin`, {
    pinned,
  });
  return res.data.data;
};

"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  getConversations,
  startConversation,
  acceptConversationRequest,
  declineConversationRequest,
  getMessages,
  sendMessage,
  deleteMessage,
  deleteConversation,
  markMessagesRead,
  reactToMessage,
  createGroupConversation,
  leaveGroupConversation,
  removeGroupMember,
  renameGroupConversation,
  addGroupParticipants,
  setGroupPhoto,
  editMessage,
  getReadReceipts,
  setConversationMuted,
  setConversationPinned,
} from "../api/messages";
import { useMessageStore } from "../store/useMessageStore";
import { Message, StartConversationInput } from "../types";

// Must be a stable reference — a fresh `[]` literal returned from the
// selector on every read makes useSyncExternalStore see a "new" snapshot
// each render and loop ("getSnapshot should be cached").
const EMPTY_MESSAGES: Message[] = [];

export function useConversations() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = user?.id as string | undefined;

  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: getConversations,
    enabled: !!userId && isAuthenticated,
    staleTime: 1000 * 30,
  });
}

export function useMessagesForConversation(conversationId?: string) {
  const setMessages = useMessageStore((state) => state.setMessages);
  const messages = useMessageStore((state) =>
    conversationId
      ? (state.messagesByConversation[conversationId] ?? EMPTY_MESSAGES)
      : EMPTY_MESSAGES,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (data && conversationId) setMessages(conversationId, data);
  }, [data, conversationId, setMessages]);

  return { messages, isLoading };
}

export function useStartConversation() {
  return useMutation({
    mutationFn: (input: StartConversationInput) => startConversation(input),
  });
}

export function useAcceptConversationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      acceptConversationRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeclineConversationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      declineConversationRequest(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      sharedPostId,
      attachmentUrls,
      replyToId,
      isForwarded,
    }: {
      conversationId: string;
      content: string;
      sharedPostId?: string;
      attachmentUrls?: string[];
      replyToId?: string;
      isForwarded?: boolean;
    }) =>
      sendMessage(
        conversationId,
        content,
        sharedPostId,
        attachmentUrls,
        replyToId,
        isForwarded,
      ),
    onSuccess: (message) => {
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const removeMessage = useMessageStore((state) => state.removeMessage);

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => deleteMessage(conversationId, messageId),
    onSuccess: (_, { conversationId, messageId }) => {
      removeMessage(conversationId, messageId);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useReactToMessage() {
  const setMessageReactions = useMessageStore((s) => s.setMessageReactions);

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      emoji,
    }: {
      conversationId: string;
      messageId: string;
      emoji: string | null;
    }) => reactToMessage(conversationId, messageId, emoji),
    onSuccess: (result, { conversationId, messageId }) => {
      setMessageReactions(conversationId, messageId, result.reactions);
    },
  });
}

export function useCreateGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      participantIds,
      name,
    }: {
      participantIds: string[];
      name?: string;
    }) => createGroupConversation(participantIds, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useLeaveGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      leaveGroupConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => removeGroupMember(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useRenameGroupConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      name,
    }: {
      conversationId: string;
      name: string | null;
    }) => renameGroupConversation(conversationId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useAddGroupParticipants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      userIds,
    }: {
      conversationId: string;
      userIds: string[];
    }) => addGroupParticipants(conversationId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSetGroupPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      imgId,
    }: {
      conversationId: string;
      imgId: string | null;
    }) => setGroupPhoto(conversationId, imgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useEditMessage() {
  const updateMessage = useMessageStore((s) => s.updateMessage);

  return useMutation({
    mutationFn: ({
      conversationId,
      messageId,
      content,
    }: {
      conversationId: string;
      messageId: string;
      content: string;
    }) => editMessage(conversationId, messageId, content),
    onSuccess: (message) => {
      updateMessage(message);
    },
  });
}

export function useReadReceipts(conversationId?: string) {
  return useQuery({
    queryKey: ["read-receipts", conversationId],
    queryFn: () => getReadReceipts(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 10,
  });
}

export function useSetConversationMuted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      muted,
    }: {
      conversationId: string;
      muted: boolean;
    }) => setConversationMuted(conversationId, muted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSetConversationPinned() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      pinned,
    }: {
      conversationId: string;
      pinned: boolean;
    }) => setConversationPinned(conversationId, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => markMessagesRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

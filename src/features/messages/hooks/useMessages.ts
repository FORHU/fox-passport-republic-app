"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
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

export function useSendMessage() {
  const queryClient = useQueryClient();
  const addMessage = useMessageStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => sendMessage(conversationId, content),
    onSuccess: (message) => {
      addMessage(message);
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

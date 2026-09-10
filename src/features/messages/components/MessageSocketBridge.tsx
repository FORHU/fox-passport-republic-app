"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SOCKET_EVENTS, subscribeRealtime } from "@/shared/lib/realtime";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useChatWindowsStore } from "../store/useChatWindowsStore";
import type { Conversation, Message, MessageReactionEntry } from "../types";

/**
 * Turns a socket `new_message` push into this feature's state, a toast, and
 * a click-through to the conversation.
 *
 * Mirrors NotificationSocketBridge: SocketProvider (in shared/) only
 * publishes the payload, since a shared provider must not import a feature.
 * Deciding what a message *is* — the store it lands in, whether to toast,
 * where "View" navigates — happens here, in the feature that owns messages.
 *
 * Mounted from `app/layout.tsx` alongside NotificationSocketBridge.
 */
export default function MessageSocketBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id as string | undefined);
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const removeMessage = useMessageStore((state) => state.removeMessage);
  const setMessageReactions = useMessageStore(
    (state) => state.setMessageReactions,
  );
  const openChat = useChatWindowsStore((state) => state.openChat);
  const openGroupChat = useChatWindowsStore((state) => state.openGroupChat);
  const closeChat = useChatWindowsStore((state) => state.closeChat);

  useEffect(
    () =>
      subscribeRealtime<Message>(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
        addMessage(message);
        // Not yet routed through DATA_INVALIDATE — see the comment on
        // SOCKET_EVENTS.NEW_MESSAGE.
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        // A group-membership notice — it's already in the message list via
        // addMessage above, but it isn't a "new message" from anyone in the
        // toast/chat-head sense.
        if (message.type === "system") return;

        if (message.senderId !== userId) {
          const conversations = queryClient.getQueryData<Conversation[]>([
            "conversations",
            userId,
          ]);
          const conversation = conversations?.find(
            (c) => c.id === message.conversationId,
          );
          // Muted means muted — no toast, no chat-head popup, same as
          // Messenger. It still lands in the store above, so the badge/list
          // preview stays accurate; it just doesn't interrupt.
          if (conversation?.isMuted) return;

          toast.info("New message", {
            description: message.content,
            action: {
              label: "View",
              onClick: () =>
                router.push(
                  `/messages?conversationId=${message.conversationId}`,
                ),
            },
          });

          // Pop the sender up as a chat head if they don't already have a
          // window open/minimized — mirrors Messenger surfacing incoming
          // chats as bubbles instead of only a toast.
          const hasWindow = useChatWindowsStore
            .getState()
            .windows.some(
              (w) =>
                w.id === message.conversationId || w.id === message.senderId,
            );
          if (!hasWindow) {
            if (conversation?.isGroup) {
              openGroupChat({
                conversationId: conversation.id,
                name: conversation.name ?? "Group",
                participants: conversation.participants ?? [],
                creatorId: conversation.creatorId,
                imgId: conversation.imgId,
                minimized: true,
              });
            } else if (conversation?.otherUser) {
              openChat({
                otherUserId: conversation.otherUser.id,
                otherUserName: conversation.otherUser.name,
                otherUserImgId: conversation.otherUser.imgId,
                contextLabel: conversation.contextLabel ?? undefined,
                isIncomingRequest: conversation.isIncomingRequest,
                conversationId: conversation.id,
                minimized: true,
              });
            }
          }
        }
      }),
    [addMessage, queryClient, userId, router, openChat, openGroupChat],
  );

  useEffect(
    () =>
      subscribeRealtime<{ conversationId: string; messageId: string }>(
        SOCKET_EVENTS.MESSAGE_DELETED,
        ({ conversationId, messageId }) => {
          removeMessage(conversationId, messageId);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
      ),
    [removeMessage, queryClient],
  );

  useEffect(
    () =>
      subscribeRealtime<{
        conversationId: string;
        messageId: string;
        reactions: MessageReactionEntry[];
      }>(
        SOCKET_EVENTS.MESSAGE_REACTION,
        ({ conversationId, messageId, reactions }) => {
          setMessageReactions(conversationId, messageId, reactions);
        },
      ),
    [setMessageReactions],
  );

  useEffect(
    () =>
      subscribeRealtime<{ conversationId: string }>(
        SOCKET_EVENTS.GROUP_REMOVED,
        ({ conversationId }) => {
          closeChat(conversationId);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          toast.info("You were removed from that group.");
        },
      ),
    [closeChat, queryClient],
  );

  useEffect(
    () =>
      subscribeRealtime<Message>(SOCKET_EVENTS.MESSAGE_EDITED, (message) => {
        updateMessage(message);
      }),
    [updateMessage],
  );

  useEffect(
    () =>
      subscribeRealtime<{ conversationId: string }>(
        SOCKET_EVENTS.READ_RECEIPT,
        ({ conversationId }) => {
          queryClient.invalidateQueries({
            queryKey: ["read-receipts", conversationId],
          });
        },
      ),
    [queryClient],
  );

  return null;
}

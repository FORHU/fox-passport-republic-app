/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, Send, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  useConversations,
  useStartConversation,
  useSendMessage,
} from "../hooks/useMessages";
import type { Message, Candidate } from "../types";

interface ForwardMessageModalProps {
  message: Message;
  onClose: () => void;
  followingUsers?: Candidate[];
}

interface Recipient {
  /** Unique across both kinds — `user:<userId>` or `group:<conversationId>`,
   * since a group's id and a user's id share no namespace guarantee. */
  key: string;
  id: string;
  name: string;
  imgId: string | null;
  isGroup: boolean;
}

// Same "Send to" sheet as SharePostModal, forwarding a message instead of a
// post — one or more people, each getting a fresh copy of this message's
// content/attachments/shared post in their own (possibly brand-new) thread.
export function ForwardMessageModal({
  message,
  onClose,
  followingUsers,
}: ForwardMessageModalProps) {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const { data: conversations = [] } = useConversations();
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const recipients = useMemo(() => {
    const byKey = new Map<string, Recipient>();
    for (const c of conversations) {
      if (c.isGroup) {
        byKey.set(`group:${c.id}`, {
          key: `group:${c.id}`,
          id: c.id,
          name: c.name ?? "Group",
          imgId: c.imgId ?? null,
          isGroup: true,
        });
        continue;
      }
      if (!c.otherUser) continue;
      byKey.set(`user:${c.otherUser.id}`, {
        key: `user:${c.otherUser.id}`,
        id: c.otherUser.id,
        name: c.otherUser.name,
        imgId: c.otherUser.imgId,
        isGroup: false,
      });
    }
    for (const f of followingUsers ?? []) {
      const key = `user:${f.id}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          id: f.id,
          name: f.name,
          imgId: f.imgId,
          isGroup: false,
        });
      }
    }
    byKey.delete(`user:${userId ?? ""}`);

    const list = Array.from(byKey.values());
    const trimmedQuery = query.trim().toLowerCase();
    return trimmedQuery
      ? list.filter((r) => r.name?.toLowerCase().includes(trimmedQuery))
      : list;
  }, [conversations, followingUsers, userId, query]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0 || sending) return;
    setSending(true);
    try {
      await Promise.all(
        Array.from(selected).map(async (key) => {
          const [kind, id] = key.split(":", 2);
          const conversationId =
            kind === "group"
              ? id
              : (await startConversation.mutateAsync({ otherUserId: id })).id;
          await sendMessage.mutateAsync({
            conversationId,
            content: message.content,
            attachmentUrls: message.attachmentUrls,
            sharedPostId: message.sharedPost?.id,
            isForwarded: true,
          });
        }),
      );
      toast.success(
        selected.size === 1
          ? "Message forwarded!"
          : `Forwarded to ${selected.size} people`,
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not forward this message.",
      );
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  const previewText =
    message.content ||
    (message.attachmentUrls?.length
      ? "📷 Photo"
      : message.sharedPost
        ? "Shared a post"
        : "");

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 sm:min-h-0 sm:max-h-[80vh] sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <h2 className="text-sm font-bold text-white">Forward Message</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message preview */}
        <div className="flex items-center gap-2.5 border-b border-zinc-800/80 px-4 py-3 shrink-0">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
            {message.attachmentUrls?.[0] || message.sharedPost?.mediaUrls[0] ? (
              <img
                src={
                  message.attachmentUrls?.[0] ??
                  message.sharedPost?.mediaUrls[0]
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              "💬"
            )}
          </div>
          <p className="text-[11px] text-zinc-400 truncate min-w-0">
            {previewText}
          </p>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Recipients */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
          {recipients.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">
              No one to show here yet.
            </p>
          ) : (
            recipients.map((r) => {
              const isSelected = selected.has(r.key);
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => toggle(r.key)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {r.imgId ? (
                        <img
                          src={r.imgId}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : r.isGroup ? (
                        <Users className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        r.name?.charAt(0)?.toUpperCase() || "?"
                      )}
                    </div>
                    {isSelected && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-lime-400 border-2 border-zinc-950">
                        <Check
                          className="h-2.5 w-2.5 text-black"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </div>
                  <p className="flex-1 min-w-0 text-xs font-bold text-zinc-200 truncate">
                    {r.name || "Unknown Citizen"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Send */}
        <div className="border-t border-zinc-800/80 p-3 shrink-0">
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
            className="w-full h-10 rounded-xl bg-lime-400 text-black text-xs font-black flex items-center justify-center gap-1.5 hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
            {selected.size > 0 ? `Send (${selected.size})` : "Send"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

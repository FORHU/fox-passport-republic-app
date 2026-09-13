/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Check, Search, Send, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  useConversations,
  useStartConversation,
  useSendMessage,
} from "../hooks/useMessages";
import type { Candidate } from "../types";

export interface SharePostTarget {
  id: string;
  content: string;
  mediaUrls: string[];
  author: { id: string; name: string; imgId?: string | null };
}

interface SharePostModalProps {
  post: SharePostTarget;
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

// Messenger-style "Send in Message" sheet: search/select one or more people,
// add an optional caption, and share a post into a (possibly brand-new)
// conversation with each of them — reusing the same startConversation +
// sendMessage plumbing ChatPanel uses, just looped over the selection.
export function SharePostModal({
  post,
  onClose,
  followingUsers,
}: SharePostModalProps) {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const { data: conversations = [] } = useConversations();
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState("");
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

  // Everyone you follow plus everyone/every group you already have a
  // thread with, deduped — recent conversation partners surface even if
  // you don't follow them, same as Messenger's recipient list mixing
  // contacts with recent chats and groups.
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
              : (
                  await startConversation.mutateAsync({
                    otherUserId: id,
                    contextType: "shared_post",
                    contextId: post.id,
                    contextLabel: `Shared a post by ${post.author.name}`,
                  })
                ).id;
          await sendMessage.mutateAsync({
            conversationId,
            content: caption.trim(),
            sharedPostId: post.id,
          });
        }),
      );
      toast.success(
        selected.size === 1
          ? "Post sent!"
          : `Post sent to ${selected.size} people`,
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Could not send this post.",
      );
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-zinc-950 sm:min-h-0 sm:max-h-[80vh] sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:border-zinc-800 sm:shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:rounded-t-2xl sm:px-5">
          <h2 className="text-sm font-bold text-white">Send Post</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Post preview */}
        <div className="flex items-center gap-2.5 border-b border-zinc-800/80 px-4 py-3 shrink-0">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
            {post.mediaUrls[0] ? (
              <img
                src={post.mediaUrls[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : post.author.imgId ? (
              <img
                src={post.author.imgId}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              post.author.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-200">
              {post.author.name}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">
              {post.content?.trim() || "Shared a post"}
            </p>
          </div>
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

        {/* Caption + Send */}
        <div className="border-t border-zinc-800/80 p-3 shrink-0 space-y-2">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-lime-400/40"
          />
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

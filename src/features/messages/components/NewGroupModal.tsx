/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useFollowing } from "@/features/follow/api/useFollow";
import {
  useConversations,
  useCreateGroupConversation,
} from "../hooks/useMessages";
import type { Conversation } from "../types";

interface Candidate {
  id: string;
  name: string;
  imgId: string | null;
}

interface NewGroupModalProps {
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
  /** Pre-selects (and guarantees a candidate row for) this person — used by
   * "Create group with {name}" from a 1:1 chat panel, where they might not
   * be in the following/recent-chats list this modal otherwise builds from. */
  initialParticipant?: Candidate;
}

// Messenger-style "New Group" sheet: pick 2+ people from who you follow or
// already chat with, give it an optional name, and create the thread —
// same recipient-picker pattern as SharePostModal/ForwardMessageModal, but
// creating a group conversation instead of fanning a send out to each person.
export function NewGroupModal({
  onClose,
  onCreated,
  initialParticipant,
}: NewGroupModalProps) {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const { data: followingPage } = useFollowing(userId);
  const { data: conversations = [] } = useConversations();
  const createGroup = useCreateGroupConversation();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialParticipant ? [initialParticipant.id] : []),
  );
  const [name, setName] = useState("");
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

  const candidates = useMemo(() => {
    const byId = new Map<string, Candidate>();
    if (initialParticipant) byId.set(initialParticipant.id, initialParticipant);
    for (const c of conversations) {
      if (c.isGroup || !c.otherUser) continue;
      byId.set(c.otherUser.id, {
        id: c.otherUser.id,
        name: c.otherUser.name,
        imgId: c.otherUser.imgId,
      });
    }
    for (const f of followingPage?.data ?? []) {
      if (!byId.has(f.id)) {
        byId.set(f.id, { id: f.id, name: f.name, imgId: f.imgId });
      }
    }
    byId.delete(userId ?? "");

    const list = Array.from(byId.values());
    const trimmedQuery = query.trim().toLowerCase();
    return trimmedQuery
      ? list.filter((c) => c.name?.toLowerCase().includes(trimmedQuery))
      : list;
  }, [conversations, followingPage, userId, query, initialParticipant]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    if (selected.size < 2 || createGroup.isPending) return;
    createGroup.mutate(
      { participantIds: Array.from(selected), name: name.trim() || undefined },
      {
        onSuccess: (conversation) => onCreated(conversation),
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message || "Could not create this group.",
          ),
      },
    );
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
          <h2 className="text-sm font-bold text-white">New Group</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-2.5 shrink-0 space-y-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name (optional)"
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-lime-400/40"
          />
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

        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
          {candidates.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">
              No one to show here yet.
            </p>
          ) : (
            candidates.map((c) => {
              const isSelected = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {c.imgId ? (
                        <img
                          src={c.imgId}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        c.name?.charAt(0)?.toUpperCase() || "?"
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
                    {c.name || "Unknown Citizen"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-zinc-800/80 p-3 shrink-0">
          <button
            onClick={handleCreate}
            disabled={selected.size < 2 || createGroup.isPending}
            className="w-full h-10 rounded-xl bg-lime-400 text-black text-xs font-black flex items-center justify-center gap-1.5 hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
            {selected.size >= 2
              ? `Create Group (${selected.size})`
              : "Select at least 2 people"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

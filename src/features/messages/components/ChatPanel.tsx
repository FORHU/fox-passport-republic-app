/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Check,
  Forward,
  Loader2,
  LogOut,
  Minus,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  PlayCircle,
  Reply,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { renderNamedMentions, type MentionableUser } from "@/shared/lib/mentions";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { SOCKET_EVENTS, subscribeRealtime } from "@/shared/lib/realtime";
import { getSocket } from "@/shared/lib/socket";
import { uploadMessageAttachment, getUserPresence } from "../api/messages";
import type { Presence } from "../types";
import {
  useConversations,
  useMessagesForConversation,
  useSendMessage,
  useDeleteMessage,
  useReactToMessage,
  useMarkMessagesRead,
  useAcceptConversationRequest,
  useDeclineConversationRequest,
  useLeaveGroupConversation,
  useRemoveGroupMember,
  useRenameGroupConversation,
  useEditMessage,
  useSetGroupPhoto,
  useReadReceipts,
} from "../hooks/useMessages";
import {
  useChatWindowsStore,
  type ChatWindowData,
} from "../store/useChatWindowsStore";
import type { Message } from "../types";
import { ForwardMessageModal } from "./ForwardMessageModal";
import { ImageLightbox } from "./ImageLightbox";
import { NewGroupModal } from "./NewGroupModal";
import { AddGroupMemberModal } from "./AddGroupMemberModal";
import { GroupMembersModal } from "./GroupMembersModal";
import {
  PANEL_WIDTH,
  PANEL_GAP,
  BUBBLE_SIZE,
  BUBBLE_GAP,
  EDGE_OFFSET,
} from "../constants";

// Hover-revealed "..." trigger on a message row, opening a tiny menu of
// Reply/Forward/Delete — one component instead of separate always-visible
// icon buttons, so a message row only ever shows one thing to hover, same
// as Messenger's per-message overflow menu.
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😠"];

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

// A muted, controls-less preview for a video attachment thumbnail — the
// actual playback happens in ImageLightbox once tapped, same as PostCard's
// grid tiles for feed post videos.
function AttachmentThumb({ url }: { url: string }) {
  if (!isVideoUrl(url)) {
    return <img src={url} alt="" className="h-28 w-full object-cover" />;
  }
  return (
    <div className="relative h-28 w-full">
      <video src={url} muted className="h-28 w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <PlayCircle className="h-7 w-7 text-white/90" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function formatLastActive(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// The caption/text portion of a message — swapped for an inline input while
// that message is being edited, shared across all three message shapes
// (shared-post, attachment, plain-text) since editing only ever touches
// `content`, never the attachments/shared post above it.
function EditableCaption({
  message,
  isEditing,
  editContent,
  onChangeEditContent,
  onSave,
  onCancel,
  bubbleClassName,
  mentionCandidates,
}: {
  message: Message;
  isEditing: boolean;
  editContent: string;
  onChangeEditContent: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Only used for the non-editing render, so each call site keeps its own
   * bubble styling (colored bubble vs. plain caption text). */
  bubbleClassName?: string;
  /** Group conversations only — the closed set of names @mentions in this
   * message's content can match against. See renderNamedMentions. */
  mentionCandidates?: MentionableUser[];
}) {
  if (isEditing) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <input
          autoFocus
          value={editContent}
          onChange={(e) => onChangeEditContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#ccff00]/40"
        />
        <button
          type="button"
          onClick={onSave}
          aria-label="Save edit"
          className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-lime-400 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  if (!message.content) return null;
  return (
    <p className={bubbleClassName}>
      {mentionCandidates?.length
        ? renderNamedMentions(message.content, mentionCandidates)
        : message.content}
      {message.editedAt && (
        <span className="ml-1 text-[9px] opacity-50">(edited)</span>
      )}
    </p>
  );
}

function groupReactions(reactions: { emoji: string; userId: string }[]) {
  const counts = new Map<string, number>();
  for (const r of reactions)
    counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
  return [...counts.entries()].map(([emoji, count]) => ({ emoji, count }));
}

function ReactionBadges({
  reactions,
  isMine,
}: {
  reactions?: { emoji: string; userId: string }[];
  isMine: boolean;
}) {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className={`flex gap-0.5 mt-1 ${isMine ? "justify-end" : ""}`}>
      {groupReactions(reactions).map(({ emoji, count }) => (
        <span
          key={emoji}
          className="flex items-center gap-0.5 rounded-full bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px]"
        >
          {emoji}
          {count > 1 && <span className="text-white/60">{count}</span>}
        </span>
      ))}
    </div>
  );
}

function MessageActions({
  isMine,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReact,
}: {
  isMine: boolean;
  onReply: () => void;
  onForward: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // Fixed-position coords for the portaled menu, computed from the trigger
  // button's own position — the messages list scrolls with overflow-y-auto,
  // which (per the CSS overflow spec) forces overflow-x to clip too, so an
  // absolutely-positioned dropdown nested inside it gets cut off at the
  // panel's edge instead of floating above everything. Portaling to <body>
  // with these coords escapes that clip the same way ChatPanel itself
  // escapes its containing block.
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const MENU_WIDTH = 176;

  const openMenu = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + 4,
        left: isMine ? rect.right - MENU_WIDTH : rect.left,
      });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-label="Message options"
        className={`h-6 w-6 rounded-full flex items-center justify-center text-white/40 shrink-0 cursor-pointer transition-opacity hover:bg-white/10 hover:text-white ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed z-[200] overflow-hidden rounded-lg border border-white/10 bg-[#151515] py-1 shadow-xl"
          >
            <div className="flex items-center justify-between px-2 py-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onReact(emoji);
                  }}
                  className="text-sm leading-none p-0.5 rounded-full hover:scale-125 hover:bg-white/10 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-white/10" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReply();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onForward();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Forward className="h-3 w-3" />
              Forward
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

// Facebook-style docked chat window/bubble. Rendered by ChatWindowsManager —
// one instance per open window in the global store — never directly by a
// trigger component, so its screen position can be coordinated with every
// other currently-open chat (side by side when open, stacked when
// minimized) instead of every trigger point placing its own panel at the
// same fixed spot.

interface ChatPanelProps {
  chatWindow: ChatWindowData;
  /** Position among currently-open (non-minimized) panels — 0 sits closest
   * to the screen edge, higher indexes stack further to the left. */
  panelIndex: number;
  /** Position among currently-minimized bubbles — 0 sits lowest, higher
   * indexes stack upward above it. */
  bubbleIndex: number;
  /** How many bubbles are currently minimized — open panels shift left to
   * leave room for the bubble column at the right edge, so bubbles always
   * dock at the true screen corner (like Messenger) instead of panels and
   * bubbles fighting over the same lane. */
  minimizedCount: number;
}

export default function ChatPanel({
  chatWindow,
  panelIndex,
  minimizedCount,
  bubbleIndex,
}: ChatPanelProps) {
  const {
    id: otherUserId,
    conversationId,
    isGroup,
    otherUserName,
    otherUserImgId,
    participants,
    creatorId,
    contextLabel,
    isIncomingRequest,
    minimized,
  } = chatWindow;

  const participantsById = useMemo(() => {
    const map = new Map<string, { name: string; imgId?: string | null }>();
    (participants ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [participants]);

  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id as string | undefined;

  // The closed set of names an @mention in this conversation can resolve
  // against — `participants` already excludes the viewer, so their own name
  // is added separately (otherwise a message mentioning the viewer
  // wouldn't render as a link from the viewer's own side of the chat).
  const mentionCandidates: MentionableUser[] = useMemo(() => {
    if (!isGroup) return [];
    const list: MentionableUser[] = (participants ?? []).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    if (currentUserId && user?.name) {
      list.push({ id: currentUserId, name: user.name });
    }
    return list;
  }, [isGroup, participants, currentUserId, user?.name]);

  const closeChat = useChatWindowsStore((s) => s.closeChat);
  const minimizeChat = useChatWindowsStore((s) => s.minimizeChat);
  const restoreChat = useChatWindowsStore((s) => s.restoreChat);
  const openGroupChatWindow = useChatWindowsStore((s) => s.openGroupChat);
  const setGroupName = useChatWindowsStore((s) => s.setGroupName);
  const setGroupParticipants = useChatWindowsStore(
    (s) => s.setGroupParticipants,
  );
  const setGroupPhotoInStore = useChatWindowsStore((s) => s.setGroupPhoto);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const renameGroup = useRenameGroupConversation();

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return "You";
    if (isGroup) return participantsById.get(senderId)?.name ?? "Someone";
    return otherUserName;
  };
  const getSenderImgId = (senderId: string) =>
    isGroup ? participantsById.get(senderId)?.imgId : otherUserImgId;
  const { messages, isLoading } = useMessagesForConversation(conversationId);
  const sendMutation = useSendMessage();
  const deleteMutation = useDeleteMessage();
  const reactMutation = useReactToMessage();
  const markReadMutation = useMarkMessagesRead();
  const acceptRequest = useAcceptConversationRequest();
  const declineRequest = useDeclineConversationRequest();
  const leaveGroup = useLeaveGroupConversation();
  const removeMember = useRemoveGroupMember();
  const editMessage = useEditMessage();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { data: conversations = [] } = useConversations();

  // Keeps this window's title/member list in sync with membership changes
  // — someone leaving or being added invalidates the conversations query
  // (see ConversationService.leaveGroup/addParticipantsToGroup), but an
  // already-open window only reads its own cached participants/name
  // otherwise, so without this an open window would keep showing a former
  // member in both the auto-generated name and the sender lookup.
  useEffect(() => {
    if (!isGroup || !conversationId) return;
    const match = conversations.find((c) => c.id === conversationId);
    if (!match?.isGroup) return;
    setGroupName(conversationId, match.name ?? "Group");
    setGroupParticipants(conversationId, match.participants ?? []);
    setGroupPhotoInStore(conversationId, match.imgId ?? null);
  }, [
    conversations,
    isGroup,
    conversationId,
    setGroupName,
    setGroupParticipants,
    setGroupPhotoInStore,
  ]);

  const [content, setContent] = useState("");
  // Group-chat @mention autocomplete: the search text after the triggering
  // "@" (null when no mention is in progress) and the index of that "@" in
  // `content`, so the picked name can be spliced back in at the right spot.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const mentionAnchorRef = useRef(0);
  const mentionSuggestions = useMemo(() => {
    if (!isGroup || mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return mentionCandidates
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [isGroup, mentionQuery, mentionCandidates]);
  // URLs already uploaded, staged to go out with the next send — uploaded
  // eagerly on file pick (not on send) so the preview thumbnail and any
  // upload failure show up immediately, same as ComposePostBox.
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  // One entry per file currently uploading, each with its own controller so
  // its X button can actually cancel that request instead of just hiding a
  // count.
  const [uploadingFiles, setUploadingFiles] = useState<
    { id: string; controller: AbortController }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupPhotoInputRef = useRef<HTMLInputElement>(null);
  const setGroupPhoto = useSetGroupPhoto();
  const { data: readReceipts = [] } = useReadReceipts(
    isGroup ? conversationId : undefined,
  );
  // The message currently staged to reply to — shown as a preview bar above
  // the composer, cleared on send or explicit cancel.
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const composerInputRef = useRef<HTMLInputElement>(null);
  // The message currently staged to forward — opens ForwardMessageModal,
  // same "Send to" flow SharePostModal uses for posts.
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null,
  );
  // The attachment currently open in the full-screen viewer.
  const [lightboxGallery, setLightboxGallery] = useState<{
    urls: string[];
    index: number;
  } | null>(null);
  const [presence, setPresence] = useState<Presence | null>(null);
  // Who's typing right now — plural only matters for groups, but tracking
  // ids (not just a boolean) lets the indicator name them there instead of
  // a generic "Typing…".
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  // One clear-timer per typer — a group can have several typing at once,
  // each clearing independently 3s after their own last "typing" event.
  const typingClearTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const typingEmitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isGroup) return;
    getUserPresence(otherUserId)
      .then(setPresence)
      .catch(() => {});
  }, [otherUserId, isGroup]);

  useEffect(
    () =>
      subscribeRealtime<{
        userId: string;
        online: boolean;
        lastActiveAt?: string;
      }>(SOCKET_EVENTS.PRESENCE_UPDATE, (payload) => {
        if (isGroup || payload.userId !== otherUserId) return;
        setPresence({
          online: payload.online,
          lastActiveAt: payload.lastActiveAt ?? null,
        });
      }),
    [otherUserId, isGroup],
  );

  useEffect(
    () =>
      subscribeRealtime<{ conversationId: string; userId: string }>(
        SOCKET_EVENTS.TYPING,
        (payload) => {
          if (payload.conversationId !== conversationId) return;
          if (!isGroup && payload.userId !== otherUserId) return;
          if (payload.userId === currentUserId) return;

          const { userId: typerId } = payload;
          setTypingUserIds((prev) =>
            prev.includes(typerId) ? prev : [...prev, typerId],
          );

          const existing = typingClearTimers.current.get(typerId);
          if (existing) clearTimeout(existing);
          typingClearTimers.current.set(
            typerId,
            setTimeout(() => {
              setTypingUserIds((prev) => prev.filter((id) => id !== typerId));
              typingClearTimers.current.delete(typerId);
            }, 3000),
          );
        },
      ),
    [otherUserId, conversationId, isGroup, currentUserId],
  );

  useEffect(() => {
    setTypingUserIds([]);
    for (const timer of typingClearTimers.current.values()) {
      clearTimeout(timer);
    }
    typingClearTimers.current.clear();
  }, [conversationId]);
  // The `isIncomingRequest` flag comes from a conversations list snapshot
  // that isn't guaranteed to re-sync the instant the accept mutation
  // resolves — this flips the prompt over to the composer immediately
  // rather than waiting on that.
  const [justAccepted, setJustAccepted] = useState(false);
  // Messages that arrived from the other person while minimized — shown as
  // a badge on the bubble, cleared the moment it's reopened.
  const [bubbleUnread, setBubbleUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<string | undefined>(undefined);
  const prevMessageCountRef = useRef(0);
  // Which conversation's history has already had its first scroll-to-bottom
  // — that first jump should land instantly, not visibly slide down the
  // whole history; only messages arriving afterward animate.
  const scrolledConversationRef = useRef<string | undefined>(undefined);
  // Portaled to <body> below — this can open from deep inside a post card,
  // and a card with `backdrop-blur`/`transform` (many have one, for the
  // hover/glass effects) becomes a new containing block for any
  // `position: fixed` descendant, trapping it inside the card's own box
  // instead of the real viewport. `document` doesn't exist during SSR, so
  // the portal only renders once mounted client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!minimized && conversationId && markedRef.current !== conversationId) {
      markedRef.current = conversationId;
      markReadMutation.mutate(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimized, conversationId]);

  useEffect(() => {
    setJustAccepted(false);
  }, [conversationId]);

  useEffect(() => {
    if (!minimized) setBubbleUnread(0);
  }, [minimized]);

  useEffect(() => {
    const added = messages.length - prevMessageCountRef.current;
    if (minimized && added > 0) {
      const fromOther = messages
        .slice(-added)
        .filter((m) => m.senderId !== currentUserId).length;
      if (fromOther > 0) setBubbleUnread((count) => count + fromOther);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, minimized, currentUserId]);

  useEffect(() => {
    if (minimized || messages.length === 0) return;
    const isFirstLoadForConversation =
      scrolledConversationRef.current !== conversationId;
    bottomRef.current?.scrollIntoView({
      behavior: isFirstLoadForConversation ? "auto" : "smooth",
    });
    scrolledConversationRef.current = conversationId;
  }, [messages.length, minimized, conversationId]);

  // Throttled to at most once every 2s — a "typing" event per keystroke
  // would flood the socket for no benefit, since the receiving side only
  // shows a coarse "is typing" state anyway.
  const emitTyping = () => {
    if (!conversationId || typingEmitTimer.current) return;
    getSocket()?.emit("typing", { conversationId });
    typingEmitTimer.current = setTimeout(() => {
      typingEmitTimer.current = null;
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (
      (!trimmed && pendingAttachments.length === 0) ||
      !conversationId ||
      sendMutation.isPending
    ) {
      return;
    }
    sendMutation.mutate(
      {
        conversationId,
        content: trimmed,
        attachmentUrls: pendingAttachments,
        replyToId: replyingTo?.id,
      },
      {
        onSuccess: () => {
          setContent("");
          setMentionQuery(null);
          setPendingAttachments([]);
          setReplyingTo(null);
        },
      },
    );
  };

  const insertMention = (candidate: MentionableUser) => {
    const at = mentionAnchorRef.current;
    const cursor = composerInputRef.current?.selectionStart ?? content.length;
    const before = content.slice(0, at);
    const after = content.slice(cursor);
    const next = `${before}@${candidate.name} ${after}`;
    setContent(next);
    setMentionQuery(null);
    const caret = before.length + candidate.name.length + 2;
    requestAnimationFrame(() => {
      composerInputRef.current?.focus();
      composerInputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    composerInputRef.current?.focus();
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Each file uploads independently — one failing (or being cancelled)
    // doesn't block or roll back the others.
    Array.from(files).forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const controller = new AbortController();
      setUploadingFiles((prev) => [...prev, { id, controller }]);
      uploadMessageAttachment(file, controller.signal)
        .then((url) => {
          if (url) setPendingAttachments((prev) => [...prev, url]);
        })
        .catch((error: any) => {
          if (
            error?.code !== "ERR_CANCELED" &&
            error?.name !== "CanceledError"
          ) {
            toast.error("Failed to upload attachment.");
          }
        })
        .finally(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
        });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelUpload = (id: string) => {
    setUploadingFiles((prev) => {
      prev.find((f) => f.id === id)?.controller.abort();
      return prev.filter((f) => f.id !== id);
    });
  };

  const removePendingAttachment = (url: string) =>
    setPendingAttachments((prev) => prev.filter((u) => u !== url));

  const handleGroupPhotoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (groupPhotoInputRef.current) groupPhotoInputRef.current.value = "";
    if (!file || !conversationId) return;
    try {
      const url = await uploadMessageAttachment(file);
      setGroupPhoto.mutate(
        { conversationId, imgId: url },
        {
          onSuccess: () => setGroupPhotoInStore(conversationId, url),
          onError: () => toast.error("Could not update the group photo."),
        },
      );
    } catch {
      toast.error("Failed to upload the photo.");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!conversationId) return;
    deleteMutation.mutate(
      { conversationId, messageId },
      {
        onError: () => toast.error("Could not delete this message."),
      },
    );
  };

  const handleStartEdit = (m: Message) => {
    setEditingMessageId(m.id);
    setEditContent(m.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = () => {
    if (!conversationId || !editingMessageId) return;
    const trimmed = editContent.trim();
    if (!trimmed) return;
    editMessage.mutate(
      { conversationId, messageId: editingMessageId, content: trimmed },
      {
        onSuccess: () => handleCancelEdit(),
        onError: () => toast.error("Could not edit this message."),
      },
    );
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!conversationId || !currentUserId) return;
    // Clicking the same emoji you already reacted with removes it —
    // matches tapping a reaction again on Messenger.
    const existing = messages
      .find((m) => m.id === messageId)
      ?.reactions?.find((r) => r.userId === currentUserId);
    const next = existing?.emoji === emoji ? null : emoji;
    reactMutation.mutate(
      { conversationId, messageId, emoji: next },
      {
        onError: () => toast.error("Could not react to this message."),
      },
    );
  };

  const handleAccept = () => {
    if (!conversationId) return;
    acceptRequest.mutate(conversationId, {
      onSuccess: () => setJustAccepted(true),
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message || "Could not accept this request.",
        ),
    });
  };

  const handleDecline = () => {
    if (!conversationId) return;
    declineRequest.mutate(conversationId, {
      onSuccess: () => closeChat(otherUserId),
      onError: (error: any) =>
        toast.error(
          error?.response?.data?.message || "Could not decline this request.",
        ),
    });
  };

  const handleStartEditGroupName = () => {
    setGroupNameInput(otherUserName);
    setEditingGroupName(true);
  };

  const handleSaveGroupName = () => {
    if (!conversationId) return;
    const trimmed = groupNameInput.trim();
    renameGroup.mutate(
      { conversationId, name: trimmed || null },
      {
        onSuccess: (conversation) => {
          setGroupName(conversationId, conversation.name ?? "Group");
          setEditingGroupName(false);
        },
        onError: () => toast.error("Could not rename this group."),
      },
    );
  };

  const showRequestPrompt = isIncomingRequest && !justAccepted;

  const handleReopen = () => {
    restoreChat(otherUserId);
    setBubbleUnread(0);
    if (conversationId) markReadMutation.mutate(conversationId);
  };

  if (!mounted) return null;

  if (minimized) {
    const bottom = EDGE_OFFSET + bubbleIndex * (BUBBLE_SIZE + BUBBLE_GAP);
    return createPortal(
      <div
        style={{
          bottom,
          right: EDGE_OFFSET,
          height: BUBBLE_SIZE,
          width: BUBBLE_SIZE,
        }}
        className="group fixed z-[100] animate-in zoom-in-90 duration-150"
      >
        <button
          type="button"
          onClick={handleReopen}
          aria-label={`Reopen chat with ${otherUserName}${bubbleUnread > 0 ? ` (${bubbleUnread} new)` : ""}`}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
        >
          {otherUserImgId ? (
            <img
              src={otherUserImgId}
              className="h-full w-full object-cover"
              alt=""
            />
          ) : (
            <span className="text-sm font-black text-white/70">
              {otherUserName?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </button>
        {bubbleUnread > 0 && (
          <span className="pointer-events-none absolute -top-1 -left-1 h-5 min-w-5 px-1 rounded-full bg-[#ff00aa] border-2 border-[#0a0a0a] text-white text-[10px] font-black flex items-center justify-center">
            {bubbleUnread > 9 ? "9+" : bubbleUnread}
          </span>
        )}
        <button
          type="button"
          onClick={() => closeChat(otherUserId)}
          aria-label={`Close chat with ${otherUserName}`}
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-900 text-white/90 shadow flex items-center justify-center cursor-pointer opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto hover:bg-red-500 transition-opacity duration-100"
        >
          <X className="h-2.5 w-2.5" strokeWidth={3} />
        </button>
      </div>,
      document.body,
    );
  }

  // Leave room for the bubble column at the right edge when any chats are
  // minimized, so open panels never sit under/behind the bubble stack.
  const bubbleColumnWidth = minimizedCount > 0 ? BUBBLE_SIZE + BUBBLE_GAP : 0;
  const right =
    EDGE_OFFSET + bubbleColumnWidth + panelIndex * (PANEL_WIDTH + PANEL_GAP);

  return (
    <>
      {forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
        />
      )}
      {groupModalOpen && (
        <NewGroupModal
          initialParticipant={{
            id: otherUserId,
            name: otherUserName,
            imgId: otherUserImgId ?? null,
          }}
          onClose={() => setGroupModalOpen(false)}
          onCreated={(conversation) => {
            setGroupModalOpen(false);
            openGroupChatWindow({
              conversationId: conversation.id,
              name: conversation.name ?? "Group",
              participants: conversation.participants ?? [],
              creatorId: conversation.creatorId,
              imgId: conversation.imgId,
            });
          }}
        />
      )}
      {addMemberModalOpen && conversationId && (
        <AddGroupMemberModal
          conversationId={conversationId}
          existingParticipantIds={(participants ?? []).map((p) => p.id)}
          onClose={() => setAddMemberModalOpen(false)}
          onAdded={(conversation) => {
            setAddMemberModalOpen(false);
            setGroupParticipants(
              conversationId,
              conversation.participants ?? [],
            );
          }}
        />
      )}
      {membersModalOpen && isGroup && currentUserId && (
        <GroupMembersModal
          groupName={otherUserName}
          participants={participants ?? []}
          currentUser={{
            id: currentUserId,
            name: user?.name ?? "You",
            imgId: user?.imgId,
          }}
          isOwner={creatorId === currentUserId}
          removingId={
            removeMember.isPending ? removeMember.variables?.userId : undefined
          }
          onRemove={(userId) => {
            if (!conversationId) return;
            removeMember.mutate(
              { conversationId, userId },
              {
                onSuccess: () => {
                  setGroupParticipants(
                    conversationId,
                    (participants ?? []).filter((p) => p.id !== userId),
                  );
                },
                onError: () => toast.error("Could not remove this member."),
              },
            );
          }}
          onClose={() => setMembersModalOpen(false)}
        />
      )}
      {lightboxGallery && (
        <ImageLightbox
          urls={lightboxGallery.urls}
          startIndex={lightboxGallery.index}
          onClose={() => setLightboxGallery(null)}
        />
      )}
      {createPortal(
        <div
          style={{ right, width: PANEL_WIDTH }}
          className="fixed bottom-0 z-[100] max-w-[calc(100vw-2rem)]"
        >
          <div className="flex h-[460px] max-h-[calc(100vh-1rem)] w-full flex-col rounded-t-2xl border border-white/10 border-b-0 bg-[#0a0a0a] shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  {isGroup ? (
                    <button
                      type="button"
                      onClick={() => groupPhotoInputRef.current?.click()}
                      disabled={setGroupPhoto.isPending}
                      aria-label="Change group photo"
                      title="Change group photo"
                      className="group relative h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black text-white/50 overflow-hidden cursor-pointer disabled:opacity-50"
                    >
                      {otherUserImgId ? (
                        <img
                          src={otherUserImgId}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        <Users className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-3.5 w-3.5 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black text-white/50 overflow-hidden">
                      {otherUserImgId ? (
                        <img
                          src={otherUserImgId}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        otherUserName?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                  )}
                  {!isGroup && presence?.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-lime-400 border-2 border-[#0a0a0a]" />
                  )}
                </div>
                <input
                  ref={groupPhotoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleGroupPhotoSelected}
                />
                <div className="min-w-0 flex-1">
                  {editingGroupName ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveGroupName();
                          if (e.key === "Escape") setEditingGroupName(false);
                        }}
                        placeholder="Group name"
                        maxLength={100}
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/40"
                      />
                      <button
                        type="button"
                        onClick={handleSaveGroupName}
                        disabled={renameGroup.isPending}
                        aria-label="Save group name"
                        className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-lime-400 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 min-w-0">
                      <span className="text-white text-sm font-bold truncate">
                        {otherUserName}
                      </span>
                      {isGroup && (
                        <button
                          type="button"
                          onClick={handleStartEditGroupName}
                          aria-label="Rename group"
                          className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" strokeWidth={2} />
                        </button>
                      )}
                    </p>
                  )}
                  {typingUserIds.length > 0 ? (
                    <p className="text-[10px] text-lime-400 truncate">
                      {isGroup
                        ? typingUserIds.length === 1
                          ? `${getSenderName(typingUserIds[0])} is typing…`
                          : typingUserIds.length === 2
                            ? `${getSenderName(typingUserIds[0])} and ${getSenderName(typingUserIds[1])} are typing…`
                            : "Several people are typing…"
                        : "Typing…"}
                    </p>
                  ) : isGroup ? (
                    <button
                      type="button"
                      onClick={() => setMembersModalOpen(true)}
                      className="text-[10px] text-white/40 hover:text-white/70 hover:underline transition-colors truncate cursor-pointer"
                    >
                      {(participants?.length ?? 0) + 1} members
                    </button>
                  ) : presence?.online ? (
                    <p className="text-[10px] text-white/40 truncate">
                      Active now
                    </p>
                  ) : presence?.lastActiveAt ? (
                    <p className="text-[10px] text-white/40 truncate">
                      Active {formatLastActive(presence.lastActiveAt)}
                    </p>
                  ) : (
                    contextLabel && (
                      <p className="text-[10px] text-white/40 truncate">
                        {contextLabel}
                      </p>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {!isGroup && (
                  <button
                    onClick={() => setGroupModalOpen(true)}
                    aria-label={`Create group with ${otherUserName}`}
                    title={`Create group with ${otherUserName}`}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
                {isGroup && (
                  <button
                    onClick={() => setAddMemberModalOpen(true)}
                    aria-label="Add member"
                    title="Add member"
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
                {isGroup && (
                  <button
                    onClick={() => {
                      if (!conversationId) return;
                      leaveGroup.mutate(conversationId, {
                        onSuccess: () => closeChat(otherUserId),
                        onError: () => toast.error("Could not leave group."),
                      });
                    }}
                    disabled={leaveGroup.isPending}
                    aria-label="Leave group"
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={() => minimizeChat(otherUserId)}
                  aria-label="Minimize"
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() => closeChat(otherUserId)}
                  aria-label="Close"
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {showRequestPrompt && (
                <div className="flex flex-col items-center text-center gap-2 py-4">
                  <div className="h-14 w-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-base font-black text-white/50 overflow-hidden shrink-0">
                    {otherUserImgId ? (
                      <img
                        src={otherUserImgId}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : (
                      otherUserName?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <p className="text-sm font-bold text-white">
                    {otherUserName}
                  </p>
                  <p className="text-[11px] text-white/40 max-w-[90%]">
                    You&apos;re not connected on the Republic yet. Accept to
                    start chatting with {otherUserName}.
                  </p>
                </div>
              )}

              {!conversationId || isLoading ? (
                <div className="flex items-center justify-center py-10 text-white/30 text-xs">
                  Loading…
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center opacity-40">
                  <MessageCircle className="h-8 w-8" strokeWidth={1.5} />
                  <p className="text-xs text-white/60">No messages yet</p>
                  <p className="text-[11px] text-white/40">
                    Say hello to get things started.
                  </p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  if (m.type === "system") {
                    return (
                      <p
                        key={m.id}
                        className="text-center text-[10px] text-white/35 py-1"
                      >
                        {m.content}
                      </p>
                    );
                  }

                  const isMine = m.senderId === currentUserId;
                  const time = new Date(m.createdAt).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  );
                  // The other person's small avatar only sits next to the
                  // last bubble in a run of their consecutive messages —
                  // same as Messenger — with an equal-size invisible spacer
                  // on every other message in that run so bubbles still
                  // line up under it instead of hugging the edge.
                  const isLastInGroup =
                    idx === messages.length - 1 ||
                    messages[idx + 1].senderId !== m.senderId;
                  const senderImgId = getSenderImgId(m.senderId);
                  const senderName = getSenderName(m.senderId);
                  const chatHead = !isMine && (
                    <div className="h-6 w-6 shrink-0 self-end">
                      {isLastInGroup &&
                        (senderImgId ? (
                          <img
                            src={senderImgId}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/50">
                            {senderName?.charAt(0)?.toUpperCase()}
                          </div>
                        ))}
                    </div>
                  );
                  const groupSenderLabel = isGroup && !isMine && (
                    <p className="text-[9px] font-bold text-white/40 mb-0.5 ml-1">
                      {senderName}
                    </p>
                  );

                  if (m.sharedPost) {
                    const actionsMenu = (
                      <MessageActions
                        isMine={isMine}
                        onReply={() => handleReply(m)}
                        onForward={() => setForwardingMessage(m)}
                        onEdit={isMine ? () => handleStartEdit(m) : undefined}
                        onDelete={
                          isMine ? () => handleDeleteMessage(m.id) : undefined
                        }
                        onReact={(emoji) => handleReactToMessage(m.id, emoji)}
                      />
                    );
                    const contentNode = (
                      <div className="max-w-[80%]">
                        {groupSenderLabel}
                        {m.isForwarded && (
                          <p className="mb-0.5 flex items-center gap-1 text-[9px] italic text-white/35">
                            <Forward className="h-2.5 w-2.5" />
                            Forwarded
                          </p>
                        )}
                        {m.replyTo && (
                          <div className="mb-1 rounded-lg border-l-2 border-white/20 bg-white/5 px-2 py-1">
                            <p className="text-[9px] font-bold text-white/50">
                              {getSenderName(m.replyTo.senderId)}
                            </p>
                            <p className="text-[10px] text-white/40 truncate max-w-[220px]">
                              {m.replyTo.content ||
                                (m.replyTo.attachmentUrls.length > 0
                                  ? "📷 Photo"
                                  : "")}
                            </p>
                          </div>
                        )}
                        <a
                          href={`/republic?postId=${m.sharedPost.id}`}
                          className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          {m.sharedPost.mediaUrls[0] && (
                            <img
                              src={m.sharedPost.mediaUrls[0]}
                              alt=""
                              className="h-32 w-full object-cover"
                            />
                          )}
                          <div className="p-2.5">
                            <p className="text-[10px] font-bold text-white/70">
                              {m.sharedPost.author.name}
                            </p>
                            <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                              {m.sharedPost.content}
                            </p>
                          </div>
                        </a>
                        <EditableCaption
                          message={m}
                          isEditing={editingMessageId === m.id}
                          editContent={editContent}
                          onChangeEditContent={setEditContent}
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                          mentionCandidates={mentionCandidates}
                          bubbleClassName={`mt-1 rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap break-words ${
                            isMine
                              ? "bg-[#ccff00] text-black rounded-br-sm"
                              : "bg-white/10 text-white rounded-bl-sm"
                          }`}
                        />
                        <p
                          className={`text-[9px] mt-1 text-white/30 ${isMine ? "text-right" : ""}`}
                        >
                          {time}
                        </p>
                        <ReactionBadges
                          reactions={m.reactions}
                          isMine={isMine}
                        />
                      </div>
                    );
                    return (
                      <div
                        key={m.id}
                        className={`group flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {isMine ? (
                          <>
                            {actionsMenu}
                            {contentNode}
                          </>
                        ) : (
                          <>
                            {chatHead}
                            {contentNode}
                            {actionsMenu}
                          </>
                        )}
                      </div>
                    );
                  }

                  if (m.attachmentUrls && m.attachmentUrls.length > 0) {
                    const actionsMenu = (
                      <MessageActions
                        isMine={isMine}
                        onReply={() => handleReply(m)}
                        onForward={() => setForwardingMessage(m)}
                        onEdit={isMine ? () => handleStartEdit(m) : undefined}
                        onDelete={
                          isMine ? () => handleDeleteMessage(m.id) : undefined
                        }
                        onReact={(emoji) => handleReactToMessage(m.id, emoji)}
                      />
                    );
                    const contentNode = (
                      <div className="max-w-[80%]">
                        {groupSenderLabel}
                        {m.isForwarded && (
                          <p className="mb-0.5 flex items-center gap-1 text-[9px] italic text-white/35">
                            <Forward className="h-2.5 w-2.5" />
                            Forwarded
                          </p>
                        )}
                        {m.replyTo && (
                          <div className="mb-1 rounded-lg border-l-2 border-white/20 bg-white/5 px-2 py-1">
                            <p className="text-[9px] font-bold text-white/50">
                              {getSenderName(m.replyTo.senderId)}
                            </p>
                            <p className="text-[10px] text-white/40 truncate max-w-[220px]">
                              {m.replyTo.content ||
                                (m.replyTo.attachmentUrls.length > 0
                                  ? "📷 Photo"
                                  : "")}
                            </p>
                          </div>
                        )}
                        <div
                          className={`grid gap-1 overflow-hidden rounded-2xl ${
                            m.attachmentUrls.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          }`}
                        >
                          {m.attachmentUrls.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setLightboxGallery({
                                  urls: m.attachmentUrls!,
                                  index: idx,
                                })
                              }
                              className="cursor-pointer"
                            >
                              <AttachmentThumb url={url} />
                            </button>
                          ))}
                        </div>
                        <EditableCaption
                          message={m}
                          isEditing={editingMessageId === m.id}
                          editContent={editContent}
                          onChangeEditContent={setEditContent}
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                          mentionCandidates={mentionCandidates}
                          bubbleClassName={`mt-1 rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap break-words ${
                            isMine
                              ? "bg-[#ccff00] text-black rounded-br-sm"
                              : "bg-white/10 text-white rounded-bl-sm"
                          }`}
                        />
                        <p
                          className={`text-[9px] mt-1 text-white/30 ${isMine ? "text-right" : ""}`}
                        >
                          {time}
                        </p>
                        <ReactionBadges
                          reactions={m.reactions}
                          isMine={isMine}
                        />
                      </div>
                    );
                    return (
                      <div
                        key={m.id}
                        className={`group flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        {isMine ? (
                          <>
                            {actionsMenu}
                            {contentNode}
                          </>
                        ) : (
                          <>
                            {chatHead}
                            {contentNode}
                            {actionsMenu}
                          </>
                        )}
                      </div>
                    );
                  }

                  const actionsMenu = (
                    <MessageActions
                      isMine={isMine}
                      onReply={() => handleReply(m)}
                      onForward={() => setForwardingMessage(m)}
                      onEdit={isMine ? () => handleStartEdit(m) : undefined}
                      onDelete={
                        isMine ? () => handleDeleteMessage(m.id) : undefined
                      }
                      onReact={(emoji) => handleReactToMessage(m.id, emoji)}
                    />
                  );
                  const contentNode = (
                    <div className="max-w-[80%]">
                      {groupSenderLabel}
                      {m.isForwarded && (
                        <p className="mb-0.5 flex items-center gap-1 text-[9px] italic text-white/35">
                          <Forward className="h-2.5 w-2.5" />
                          Forwarded
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-xs ${
                          isMine
                            ? "bg-[#ccff00] text-black rounded-br-sm"
                            : "bg-white/10 text-white rounded-bl-sm"
                        }`}
                      >
                        {m.replyTo && (
                          <div
                            className={`mb-1 rounded-lg border-l-2 px-2 py-1 ${
                              isMine
                                ? "border-black/20 bg-black/10"
                                : "border-white/20 bg-white/5"
                            }`}
                          >
                            <p
                              className={`text-[9px] font-bold ${isMine ? "text-black/60" : "text-white/50"}`}
                            >
                              {getSenderName(m.replyTo.senderId)}
                            </p>
                            <p
                              className={`text-[10px] truncate max-w-[220px] ${isMine ? "text-black/50" : "text-white/40"}`}
                            >
                              {m.replyTo.content ||
                                (m.replyTo.attachmentUrls.length > 0
                                  ? "📷 Photo"
                                  : "")}
                            </p>
                          </div>
                        )}
                        <EditableCaption
                          message={m}
                          isEditing={editingMessageId === m.id}
                          editContent={editContent}
                          onChangeEditContent={setEditContent}
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                          mentionCandidates={mentionCandidates}
                          bubbleClassName="whitespace-pre-wrap break-words"
                        />
                        <p
                          className={`text-[9px] mt-1 ${isMine ? "text-black/50" : "text-white/30"}`}
                        >
                          {time}
                        </p>
                      </div>
                      <ReactionBadges reactions={m.reactions} isMine={isMine} />
                    </div>
                  );
                  return (
                    <div
                      key={m.id}
                      className={`group flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      {isMine ? (
                        <>
                          {actionsMenu}
                          {contentNode}
                        </>
                      ) : (
                        <>
                          {chatHead}
                          {contentNode}
                          {actionsMenu}
                        </>
                      )}
                    </div>
                  );
                })
              )}
              {(() => {
                const lastMine = [...messages]
                  .reverse()
                  .find((m) => m.senderId === currentUserId);
                if (!lastMine) return null;

                if (!isGroup) {
                  if (!lastMine.readAt) return null;
                  return (
                    <p className="text-right text-[9px] text-white/30 pr-1">
                      Seen
                    </p>
                  );
                }

                // Group: name whoever's read cursor has caught up to this
                // message, instead of a single ambiguous "Seen".
                const lastMineAt = new Date(lastMine.createdAt).getTime();
                const seenByNames = readReceipts
                  .filter(
                    (r) =>
                      r.userId !== currentUserId &&
                      new Date(r.lastReadAt).getTime() >= lastMineAt,
                  )
                  .map((r) => getSenderName(r.userId));
                if (seenByNames.length === 0) return null;
                return (
                  <p className="text-right text-[9px] text-white/30 pr-1">
                    Seen by {seenByNames.join(", ")}
                  </p>
                );
              })()}
              <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-2.5 shrink-0">
              {showRequestPrompt ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={acceptRequest.isPending}
                    className="flex-1 h-9 rounded-xl bg-[#ccff00] text-black text-xs font-black hover:bg-[#b8e600] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={declineRequest.isPending}
                    className="flex-1 h-9 rounded-xl bg-white/10 text-white/70 text-xs font-bold hover:bg-white/15 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {replyingTo && (
                    <div className="flex items-center gap-2 rounded-lg border-l-2 border-[#ccff00]/60 bg-white/5 px-2.5 py-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-white/50">
                          Replying to{" "}
                          {replyingTo.senderId === currentUserId
                            ? "yourself"
                            : getSenderName(replyingTo.senderId)}
                        </p>
                        <p className="text-[10px] text-white/40 truncate">
                          {replyingTo.content ||
                            (replyingTo.attachmentUrls?.length
                              ? "📷 Photo"
                              : replyingTo.sharedPost
                                ? "Shared a post"
                                : "")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        aria-label="Cancel reply"
                        className="h-5 w-5 rounded-full flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {(pendingAttachments.length > 0 ||
                    uploadingFiles.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {pendingAttachments.map((url) => (
                        <div key={url} className="relative h-12 w-12 shrink-0">
                          {isVideoUrl(url) ? (
                            <video
                              src={url}
                              muted
                              className="h-full w-full rounded-lg object-cover border border-white/10"
                            />
                          ) : (
                            <img
                              src={url}
                              alt=""
                              onError={() => removePendingAttachment(url)}
                              className="h-full w-full rounded-lg object-cover border border-white/10"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removePendingAttachment(url)}
                            aria-label="Remove attachment"
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-900 text-white/90 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
                          >
                            <X className="h-2.5 w-2.5" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {uploadingFiles.map((u) => (
                        <div key={u.id} className="relative h-12 w-12 shrink-0">
                          <div className="h-full w-full rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                          </div>
                          <button
                            type="button"
                            onClick={() => cancelUpload(u.id)}
                            aria-label="Cancel upload"
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-900 text-white/90 flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
                          >
                            <X className="h-2.5 w-2.5" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      hidden
                      onChange={handleFilesSelected}
                    />
                    <button
                      type="button"
                      onClick={handleAttachClick}
                      disabled={!conversationId}
                      aria-label="Attach image"
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                    >
                      <Paperclip className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <div className="relative flex-1">
                      {mentionQuery !== null && mentionSuggestions.length > 0 && (
                        <div className="absolute left-0 bottom-full z-20 mb-1 w-56 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 shadow-2xl py-1">
                          {mentionSuggestions.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => insertMention(c)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors"
                            >
                              <span className="text-xs font-bold text-white truncate">
                                {c.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        ref={composerInputRef}
                        value={content}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cursor = e.target.selectionStart ?? value.length;
                          setContent(value);
                          emitTyping();

                          if (isGroup) {
                            const uptoCursor = value.slice(0, cursor);
                            const at = uptoCursor.lastIndexOf("@");
                            const precededByBoundary =
                              at === 0 || /\s/.test(uptoCursor[at - 1] ?? "");
                            const tail = uptoCursor.slice(at + 1);
                            if (
                              at !== -1 &&
                              precededByBoundary &&
                              !/[\n@]/.test(tail) &&
                              tail.length <= 40
                            ) {
                              mentionAnchorRef.current = at;
                              setMentionQuery(tail);
                            } else {
                              setMentionQuery(null);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape" && mentionQuery !== null) {
                            setMentionQuery(null);
                            return;
                          }
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message…"
                        disabled={!conversationId}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ccff00]/40 disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={
                        !conversationId ||
                        (!content.trim() && pendingAttachments.length === 0) ||
                        sendMutation.isPending
                      }
                      className="h-9 w-9 rounded-xl bg-[#ccff00] text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="h-[18px] w-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

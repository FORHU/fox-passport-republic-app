import { create } from "zustand";
import { toast } from "sonner";

export interface ChatParticipant {
  id: string;
  name: string;
  imgId?: string | null;
}

export interface ChatWindowData {
  /** Stable key windows are deduped on: the other participant's user id
   * for a 1:1, the conversation id for a group (a group has no single
   * "other user" to key off). */
  id: string;
  conversationId?: string;
  isGroup: boolean;
  otherUserName: string;
  otherUserImgId?: string | null;
  /** Group-only: the other members, for rendering a name/avatar stack when
   * the group has no explicit name. */
  participants?: ChatParticipant[];
  /** Group-only: only this user may remove other members. */
  creatorId?: string;
  contextLabel?: string;
  isIncomingRequest?: boolean;
  minimized: boolean;
}

interface OpenChatInput {
  otherUserId: string;
  otherUserName: string;
  otherUserImgId?: string | null;
  contextLabel?: string;
  isIncomingRequest?: boolean;
  conversationId?: string;
  /** Opens as a minimized bubble instead of a full panel — used when a new
   * message arrives from someone who doesn't have a window open yet, so it
   * pops up as a chat head (like Messenger) instead of stealing focus with
   * a full panel. */
  minimized?: boolean;
}

interface OpenGroupChatInput {
  conversationId: string;
  name: string;
  participants: ChatParticipant[];
  creatorId?: string;
  imgId?: string | null;
  minimized?: boolean;
}

interface ChatWindowsState {
  windows: ChatWindowData[];
  /** How many *open* (non-minimized) panels currently fit on screen side by
   * side — set by ChatWindowsManager from the real viewport width, and kept
   * in sync on resize. Minimized bubbles don't count against this; only
   * open panels take up the width that matters. */
  maxOpenWindows: number;
  setMaxOpenWindows: (max: number) => void;
  openChat: (input: OpenChatInput) => void;
  openGroupChat: (input: OpenGroupChatInput) => void;
  setConversationId: (otherUserId: string, conversationId: string) => void;
  setGroupName: (conversationId: string, name: string) => void;
  setGroupParticipants: (
    conversationId: string,
    participants: ChatParticipant[],
  ) => void;
  setGroupPhoto: (conversationId: string, imgId: string | null) => void;
  closeChat: (otherUserId: string) => void;
  minimizeChat: (otherUserId: string) => void;
  restoreChat: (otherUserId: string) => void;
}

// A single global list of chat windows (open panels + minimized bubbles),
// driving one <ChatWindowsManager/> mounted at the app root — the previous
// design had every trigger point (FollowingWidget, MessageButton,
// ConversationListClient) own its own local chat state and render its own
// <ChatPanel>, so opening chats from two places just stacked both panels on
// the exact same fixed position instead of coordinating like Messenger does.
export const useChatWindowsStore = create<ChatWindowsState>((set, get) => ({
  windows: [],
  // A conservative placeholder until ChatWindowsManager measures the real
  // viewport and calls setMaxOpenWindows — high enough not to block a chat
  // opened in the instant before that first measurement lands.
  maxOpenWindows: 99,

  setMaxOpenWindows: (max) => set({ maxOpenWindows: max }),

  openChat: (input) => {
    const state = get();
    const existing = state.windows.find((w) => w.id === input.otherUserId);
    const openCount = state.windows.filter((w) => !w.minimized).length;

    if (existing) {
      // Already open — just refresh whatever details changed, no room to
      // find. Currently minimized — this is a restore, which does need room.
      if (!existing.minimized || openCount < state.maxOpenWindows) {
        set({
          windows: state.windows.map((w) =>
            w.id === input.otherUserId
              ? {
                  ...w,
                  minimized: false,
                  otherUserName: input.otherUserName,
                  otherUserImgId: input.otherUserImgId,
                  contextLabel: input.contextLabel ?? w.contextLabel,
                  isIncomingRequest:
                    input.isIncomingRequest ?? w.isIncomingRequest,
                  conversationId: input.conversationId ?? w.conversationId,
                }
              : w,
          ),
        });
      } else {
        toast.error("Your chat windows are full — close one to open another.");
      }
      return;
    }

    if (openCount >= state.maxOpenWindows) {
      toast.error("Your chat windows are full — close one to open another.");
      return;
    }

    const next: ChatWindowData = {
      id: input.otherUserId,
      conversationId: input.conversationId,
      isGroup: false,
      otherUserName: input.otherUserName,
      otherUserImgId: input.otherUserImgId,
      contextLabel: input.contextLabel,
      isIncomingRequest: input.isIncomingRequest,
      minimized: input.minimized ?? false,
    };
    set({ windows: [...state.windows, next] });
  },

  openGroupChat: (input) => {
    const state = get();
    const existing = state.windows.find((w) => w.id === input.conversationId);
    const openCount = state.windows.filter((w) => !w.minimized).length;

    if (existing) {
      if (!existing.minimized || openCount < state.maxOpenWindows) {
        set({
          windows: state.windows.map((w) =>
            w.id === input.conversationId
              ? {
                  ...w,
                  minimized: false,
                  otherUserName: input.name,
                  otherUserImgId: input.imgId ?? w.otherUserImgId,
                  participants: input.participants,
                  creatorId: input.creatorId ?? w.creatorId,
                }
              : w,
          ),
        });
      } else {
        toast.error("Your chat windows are full — close one to open another.");
      }
      return;
    }

    if (openCount >= state.maxOpenWindows) {
      toast.error("Your chat windows are full — close one to open another.");
      return;
    }

    const next: ChatWindowData = {
      id: input.conversationId,
      conversationId: input.conversationId,
      isGroup: true,
      otherUserName: input.name,
      otherUserImgId: input.imgId,
      participants: input.participants,
      creatorId: input.creatorId,
      minimized: input.minimized ?? false,
    };
    set({ windows: [...state.windows, next] });
  },

  setConversationId: (otherUserId, conversationId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === otherUserId ? { ...w, conversationId } : w,
      ),
    })),

  setGroupName: (conversationId, name) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === conversationId ? { ...w, otherUserName: name } : w,
      ),
    })),

  setGroupParticipants: (conversationId, participants) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === conversationId ? { ...w, participants } : w,
      ),
    })),

  setGroupPhoto: (conversationId, imgId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === conversationId ? { ...w, otherUserImgId: imgId } : w,
      ),
    })),

  closeChat: (otherUserId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== otherUserId),
    })),

  minimizeChat: (otherUserId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === otherUserId ? { ...w, minimized: true } : w,
      ),
    })),

  restoreChat: (otherUserId) => {
    const state = get();
    const openCount = state.windows.filter((w) => !w.minimized).length;
    if (openCount >= state.maxOpenWindows) {
      toast.error("Your chat windows are full — close one to open another.");
      return;
    }
    set({
      windows: state.windows.map((w) =>
        w.id === otherUserId ? { ...w, minimized: false } : w,
      ),
    });
  },
}));

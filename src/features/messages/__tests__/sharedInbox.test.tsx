import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import {
  openConversationWindow,
  useChatWindowsStore,
} from "@/features/messages/store/useChatWindowsStore";
import InboxMessageButton from "@/features/messages/components/InboxMessageButton";
import type { Conversation } from "@/features/messages/types";

/**
 * Shared Inbox (CONTEXT.md). A thread that belongs to a Venue or Event opens
 * as one window keyed on the conversation — like a group, since its team side
 * is several people — titled with the Venue or Event for its guest and with
 * the guest for its team.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.hoisted(() => ({ startInboxConversation: vi.fn() }));
vi.mock("@/features/messages/api/messages", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  startInboxConversation: api.startInboxConversation,
}));

const base: Conversation = {
  id: "c1",
  isGroup: false,
  otherUser: null,
  contextType: "venue_inbox",
  contextLabel: "Sky Hall",
  lastMessageAt: null,
  createdAt: "2026-09-24T00:00:00Z",
  unreadCount: 0,
  status: "accepted",
  isIncomingRequest: false,
  lastMessage: null,
  isMuted: false,
  isPinned: false,
  pinnedAt: null,
  isInbox: true,
  inbox: { type: "venue", id: "v1", name: "Sky Hall" },
};

beforeEach(() => {
  vi.clearAllMocks();
  useChatWindowsStore.setState({ windows: [], maxOpenWindows: 5 });
});

describe("openConversationWindow for a Shared Inbox thread", () => {
  it("titles the guest's window with the Venue", () => {
    openConversationWindow({ ...base, viewerRole: "guest" });
    const [w] = useChatWindowsStore.getState().windows;
    expect(w).toMatchObject({
      id: "c1",
      conversationId: "c1",
      otherUserName: "Sky Hall",
      inbox: { type: "venue", id: "v1", viewerRole: "guest" },
    });
  });

  it("titles the team's window with the guest", () => {
    openConversationWindow({
      ...base,
      viewerRole: "team",
      otherUser: { id: "rosa", name: "Rosa", imgId: null },
    });
    const [w] = useChatWindowsStore.getState().windows;
    expect(w.otherUserName).toBe("Rosa");
    expect(w.inbox?.viewerRole).toBe("team");
  });

  it("keys on the conversation, so two guests' threads never share a window", () => {
    openConversationWindow({
      ...base,
      viewerRole: "team",
      otherUser: { id: "rosa", name: "Rosa", imgId: null },
    });
    openConversationWindow({
      ...base,
      id: "c2",
      viewerRole: "team",
      otherUser: { id: "sam", name: "Sam", imgId: null },
    });
    expect(useChatWindowsStore.getState().windows.map((w) => w.id)).toEqual([
      "c1",
      "c2",
    ]);
  });

  it("never collapses a window the viewer already has open", () => {
    openConversationWindow({ ...base, viewerRole: "guest" });
    openConversationWindow({ ...base, viewerRole: "guest" }, { minimized: true });
    expect(useChatWindowsStore.getState().windows[0].minimized).toBe(false);
  });
});

describe("InboxMessageButton", () => {
  it("opens the Venue's thread and its window", async () => {
    api.startInboxConversation.mockResolvedValue({
      ...base,
      viewerRole: "guest",
    });
    render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(InboxMessageButton, {
          venueId: "v1",
          label: "Message Venue",
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: /message venue/i }));
    await waitFor(() =>
      expect(api.startInboxConversation).toHaveBeenCalledWith(
        { venueId: "v1", eventId: undefined, guestId: undefined },
        expect.anything(),
      ),
    );
    await waitFor(() =>
      expect(useChatWindowsStore.getState().windows[0]?.id).toBe("c1"),
    );
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SharePostModal } from "@/features/messages/components/SharePostModal";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import type { Conversation } from "@/features/messages/types";

/**
 * "Send in message" on a Republic post (app#385): pick anyone (recent chats,
 * people you follow, or a name search), send, and hear plainly how it went.
 * One failed recipient doesn't hide the sends that worked.
 */

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));
vi.mock("sonner", () => ({ toast }));

const api = vi.hoisted(() => ({
  getConversations: vi.fn(),
  startConversation: vi.fn(),
  sendMessage: vi.fn(),
}));
vi.mock("@/features/messages/api/messages", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...api,
}));

const feed = vi.hoisted(() => ({ searchMentionCandidates: vi.fn() }));
vi.mock("@/shared/api/feed", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...feed,
}));

const post = {
  id: "p1",
  content: "Launch night",
  mediaUrls: [],
  author: { id: "fox", name: "Fox Partner", imgId: null },
};

const chatWith = (id: string, name: string): Conversation =>
  ({
    id: `c-${id}`,
    isGroup: false,
    otherUser: { id, name, imgId: null },
  }) as unknown as Conversation;

const onClose = vi.fn();
const onSent = vi.fn();

function renderModal(followingUsers = [{ id: "cy", name: "Cy", imgId: null }]) {
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <SharePostModal
        post={post}
        onClose={onClose}
        onSent={onSent}
        followingUsers={followingUsers as never}
      />
    </QueryClientProvider>,
  );
}

const person = (name: string) =>
  screen.findByRole("button", { name: new RegExp(`^${name}$`, "i") });
const sendButton = () => screen.getByRole("button", { name: /^send/i });

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    isAuthenticated: true,
    user: { id: "me", name: "Me" } as never,
  });
  api.getConversations.mockResolvedValue([
    chatWith("ana", "Ana"),
    chatWith("ben", "Ben"),
  ]);
  api.startConversation.mockImplementation(async ({ otherUserId }) => ({
    id: `c-${otherUserId}`,
  }));
  api.sendMessage.mockImplementation(async (conversationId: string) => ({
    id: `m-${conversationId}`,
    conversationId,
    content: "",
  }));
  feed.searchMentionCandidates.mockResolvedValue([]);
});

describe("SharePostModal", () => {
  it("lists recent chats and people you follow", async () => {
    renderModal();
    expect(await person("Ana")).toBeInTheDocument();
    expect(await person("Ben")).toBeInTheDocument();
    expect(await person("Cy")).toBeInTheDocument();
  });

  it("finds someone you've never talked to by name", async () => {
    feed.searchMentionCandidates.mockResolvedValue([
      { id: "dee", name: "Dee Santos", username: "dee", imgId: null },
      { id: "ana", name: "Ana", username: "ana", imgId: null },
      { id: "me", name: "Me", username: "me", imgId: null },
    ]);
    renderModal();
    await person("Ana");

    fireEvent.change(screen.getByRole("textbox", { name: /search people/i }), {
      target: { value: "de" },
    });

    expect(await person("Dee Santos")).toBeInTheDocument();
    expect(feed.searchMentionCandidates).toHaveBeenCalledWith("de");
    // Never yourself, and no one twice.
    expect(screen.queryByRole("button", { name: /^me$/i })).toBeNull();
  });

  it("sends to everyone picked, then confirms, counts and closes", async () => {
    renderModal();
    fireEvent.click(await person("Ana"));
    fireEvent.click(await person("Cy"));
    fireEvent.change(screen.getByPlaceholderText(/caption/i), {
      target: { value: "  see this  " },
    });
    fireEvent.click(sendButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.sendMessage).toHaveBeenCalledWith(
      "c-ana",
      "see this",
      "p1",
      undefined,
      undefined,
      undefined,
    );
    expect(api.startConversation).toHaveBeenCalledWith(
      expect.objectContaining({ otherUserId: "cy", contextId: "p1" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Post sent to 2 people");
    expect(onSent).toHaveBeenCalledWith(2);
  });

  it("says who it couldn't reach, counts the rest, and keeps them to retry", async () => {
    api.sendMessage.mockImplementation(async (conversationId: string) => {
      if (conversationId === "c-ben") throw new Error("blocked");
      return { id: "m1", conversationId, content: "" };
    });
    renderModal();
    fireEvent.click(await person("Ana"));
    fireEvent.click(await person("Ben"));
    fireEvent.click(sendButton());

    await waitFor(() => expect(toast.warning).toHaveBeenCalled());
    expect(toast.warning.mock.calls[0][0]).toBe(
      "Sent to 1 of 2. Couldn't send to Ben.",
    );
    expect(onSent).toHaveBeenCalledWith(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(await person("Ben")).toHaveAttribute("aria-pressed", "true");
    expect(await person("Ana")).toHaveAttribute("aria-pressed", "false");
    expect(sendButton()).toHaveTextContent("Send (1)");
  });

  it("when nothing went out, shows the reason and stays open", async () => {
    api.sendMessage.mockRejectedValue(
      Object.assign(new Error("x"), {
        response: {
          status: 403,
          data: { message: "You can't message this citizen" },
        },
      }),
    );
    renderModal();
    fireEvent.click(await person("Ana"));
    fireEvent.click(sendButton());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("You can't message this citizen"),
    );
    expect(onSent).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("never shows server internals when sending fails", async () => {
    api.sendMessage.mockRejectedValue(
      Object.assign(new Error("x"), { response: { status: 500, data: {} } }),
    );
    renderModal();
    fireEvent.click(await person("Ana"));
    fireEvent.click(sendButton());

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Could not send this post."),
    );
  });
});

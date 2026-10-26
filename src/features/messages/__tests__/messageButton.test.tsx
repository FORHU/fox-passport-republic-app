import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import MessageButton from "@/features/messages/components/MessageButton";
import { useChatWindowsStore } from "@/features/messages/store/useChatWindowsStore";
import { useAuthStore } from "@/shared/auth/useAuthStore";

/**
 * MessageButton opens a one-to-one chat (e.g. "Ask the Event Foxer" on a full
 * package). Signed out it asks for sign-in first: the conversation call could
 * only fail, after a chat window had already opened empty.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.hoisted(() => ({ startConversation: vi.fn() }));
vi.mock("@/features/messages/api/messages", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  startConversation: api.startConversation,
}));

const openLogin = vi.fn();

function renderButton() {
  render(
    createElement(
      QueryClientProvider,
      { client: new QueryClient() },
      createElement(MessageButton, {
        otherUserId: "foxer-1",
        otherUserName: "Ivan",
        contextType: "event",
        contextId: "tpl-1",
        contextLabel: "Fiesta Birthday",
        label: "Ask the Event Foxer",
      }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: /ask the event foxer/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
  useChatWindowsStore.setState({ windows: [], maxOpenWindows: 5 });
  useAuthStore.setState({ openLogin });
});

describe("MessageButton", () => {
  it("signed out, opens sign-in and no chat window", () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderButton();
    expect(openLogin).toHaveBeenCalledTimes(1);
    expect(api.startConversation).not.toHaveBeenCalled();
    expect(useChatWindowsStore.getState().windows).toHaveLength(0);
  });

  it("signed in, opens the chat with the event attached", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    api.startConversation.mockResolvedValue({ id: "c1" });
    renderButton();
    expect(openLogin).not.toHaveBeenCalled();
    expect(useChatWindowsStore.getState().windows).toHaveLength(1);
    await waitFor(() =>
      expect(api.startConversation).toHaveBeenCalledWith(
        expect.objectContaining({
          otherUserId: "foxer-1",
          contextType: "event",
          contextId: "tpl-1",
        }),
      ),
    );
  });
});

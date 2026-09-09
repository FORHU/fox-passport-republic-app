import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { FollowButton } from "@/features/follow/components/FollowButton";

/**
 * The toggle used to wait on the full request round trip before the button
 * changed at all — `isPending` gated both the disabled state and the
 * label/icon. These tests pin the fix: the click result is visible
 * immediately (before the mocked request resolves), and a failed request
 * rolls the label back rather than leaving a false "Following"/"Requested".
 */

const authState = vi.hoisted(() => ({
  user: { id: "me-1" } as { id: string } | null,
  openLogin: vi.fn(),
}));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/features/block/api/useBlock", () => ({
  useBlockStatus: () => ({ data: { blockedByMe: false, blockedMe: false } }),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const sendFollowRequest = vi.fn();
const removeFollow = vi.fn();
const getFollowStatus = vi.fn();

vi.mock("@/features/follow/api/follows", () => ({
  sendFollowRequest: (...args: unknown[]) => sendFollowRequest(...args),
  removeFollow: (...args: unknown[]) => removeFollow(...args),
  getFollowStatus: (...args: unknown[]) => getFollowStatus(...args),
}));

function renderButton(targetId = "target-1") {
  const client = new QueryClient();
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(FollowButton, { targetId }),
    ),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authState.user = { id: "me-1" };
  getFollowStatus.mockResolvedValue({ status: "none", direction: null });
});

describe("FollowButton optimistic toggle", () => {
  it("shows the new state immediately on click, before the request resolves", async () => {
    let resolveSend!: (v: { status: string }) => void;
    sendFollowRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve;
      }),
    );

    renderButton();
    // Wait for the initial status fetch to settle, not just for the label
    // text — the label reads "Follow" even while `isLoading` is still true
    // (it defaults `relation` to "none"), and the button stays disabled
    // (and un-clickable in jsdom) until loading actually finishes.
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button"));

    // The request hasn't resolved yet, but the button already reflects the
    // optimistic "pending" state — this is the assertion that fails without
    // the onMutate change.
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/requested/i),
    );
    expect(sendFollowRequest).toHaveBeenCalledWith("target-1");

    resolveSend({ status: "accepted" });
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/following/i),
    );
  });

  it("rolls back to the previous label if the request fails", async () => {
    // Rejects immediately (unlike the other tests' deferred promise), so the
    // optimistic "pending" state and its rollback can both land before the
    // first `waitFor` poll — only the end state is reliably observable here.
    sendFollowRequest.mockRejectedValue(new Error("nope"));

    renderButton();
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/^follow$/i),
    );
    expect(sendFollowRequest).toHaveBeenCalledWith("target-1");
  });

  it("does not disable the button for the whole round trip — only until the click is processed", async () => {
    let resolveSend!: (v: { status: string }) => void;
    sendFollowRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve;
      }),
    );

    renderButton();
    await waitFor(() =>
      expect(screen.getByRole("button")).not.toBeDisabled(),
    );

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/requested/i),
    );

    resolveSend({ status: "accepted" });
    await waitFor(() =>
      expect(screen.getByRole("button")).not.toBeDisabled(),
    );
  });

  it("unfollows immediately on click without waiting for the response", async () => {
    getFollowStatus.mockResolvedValue({
      status: "accepted",
      direction: "outgoing",
    });
    let resolveRemove!: (v: { status: "none" }) => void;
    removeFollow.mockReturnValue(
      new Promise((resolve) => {
        resolveRemove = resolve;
      }),
    );

    renderButton();
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/following/i),
    );

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/^follow$/i),
    );

    resolveRemove({ status: "none" });
  });
});

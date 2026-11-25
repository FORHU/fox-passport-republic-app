import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Notification } from "@/shared/types/notification";

/** api#451: clicking a Republic notification opens its post or comment. */

const h = vi.hoisted(() => ({
  push: vi.fn(),
  markAsRead: vi.fn(),
  toastInfo: vi.fn(),
  notifications: [] as Notification[],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, replace: vi.fn() }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: () => ({ isAuthenticated: true }),
}));

vi.mock("@/features/notifications/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: h.notifications,
    unreadCount: 0,
    isLoading: false,
    markAsRead: h.markAsRead,
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock("@/shared/components/layout/LandingHeader", () => ({
  default: () => <header data-testid="landing-header" />,
}));

vi.mock("sonner", () => ({ toast: { info: h.toastInfo } }));

import NotificationListClient from "@/features/notifications/components/NotificationListClient";

const feed = (title: string, target: Notification["target"]): Notification => ({
  id: title,
  userId: "u1",
  type: "feed:reply",
  title,
  message: "",
  isRead: true,
  metadata: {},
  target,
  createdAt: "2026-11-24T00:00:00.000Z",
});

beforeEach(() => vi.clearAllMocks());

describe("NotificationListClient routing", () => {
  it("opens the post at the reply", async () => {
    h.notifications = [
      feed("New reply to your comment", {
        type: "reply",
        postId: "p1",
        commentId: "r1",
        parentCommentId: "c1",
        available: true,
      }),
    ];
    render(<NotificationListClient />);

    fireEvent.click(await screen.findByText("New reply to your comment"));

    expect(h.push).toHaveBeenCalledWith("/republic?postId=p1&commentId=r1");
  });

  it("says a deleted post is gone instead of navigating", async () => {
    h.notifications = [
      feed("New Reaction on your Republic Post", {
        type: "post",
        postId: "gone",
        commentId: null,
        parentCommentId: null,
        available: false,
      }),
    ];
    render(<NotificationListClient />);

    fireEvent.click(
      await screen.findByText("New Reaction on your Republic Post"),
    );

    expect(h.push).not.toHaveBeenCalled();
    expect(h.toastInfo).toHaveBeenCalledWith(
      "This post is no longer available.",
    );
  });
});

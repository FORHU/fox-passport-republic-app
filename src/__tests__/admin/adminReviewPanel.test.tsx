import { describe, it, expect, vi, afterEach } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

const auth = vi.hoisted(() => ({ user: { permissions: ["queue:read"] } }));
vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (select: (s: typeof auth) => unknown) => select(auth),
}));

import AdminReviewPanel from "@/features/admin/components/AdminReviewPanel";

/**
 * Events that ended with nobody checked in, each booking settled by an admin:
 * attended or no-show. Only an admin who may decide queue items sees the
 * buttons, and an unpaid booking can only be closed as a no-show.
 */

const EVENT = {
  id: "e1",
  name: "Fox Night",
  startAt: "2026-10-20T10:00:00Z",
  endAt: "2026-10-20T14:00:00Z",
  reviewFlaggedAt: "2026-10-21T01:00:00Z",
  host: { name: "Ivan", email: "ivan@test.com" },
  bookings: [
    {
      id: "b-paid",
      status: "confirmed",
      checkedIn: false,
      guestCount: 4,
      user: { id: "u1", name: "Ana", email: "ana@test.com" },
    },
    {
      id: "b-unpaid",
      status: "pending",
      checkedIn: false,
      guestCount: 2,
      user: { id: "u2", name: "Ben", email: "ben@test.com" },
    },
    {
      id: "b-done",
      status: "completed",
      checkedIn: true,
      guestCount: 1,
      user: { id: "u3", name: "Cy", email: "cy@test.com" },
    },
  ],
};

function renderPanel(permissions: string[]) {
  auth.user = { permissions };
  api.get.mockResolvedValue({ data: { data: [EVENT] } });
  api.patch.mockResolvedValue({ data: { data: {} } });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminReviewPanel />
    </QueryClientProvider>,
  );
}

describe("AdminReviewPanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("settles a booking with the chosen outcome", async () => {
    renderPanel(["queue:read", "queue:decide"]);
    await screen.findByText("Fox Night");

    const [attended] = screen.getAllByRole("button", { name: "Attended" });
    await act(async () => {
      fireEvent.click(attended);
    });
    expect(api.patch).toHaveBeenCalledWith(
      "/admin/bookings/b-paid/review-outcome",
      { outcome: "attended" },
    );

    const noShows = screen.getAllByRole("button", { name: "No-show" });
    await act(async () => {
      fireEvent.click(noShows[1]);
    });
    expect(api.patch).toHaveBeenCalledWith(
      "/admin/bookings/b-unpaid/review-outcome",
      { outcome: "noShow" },
    );
  });

  it("offers only no-show for an unpaid booking, and nothing for a settled one", async () => {
    renderPanel(["queue:read", "queue:decide"]);
    await screen.findByText("Fox Night");

    const attended = screen.getAllByRole("button", { name: "Attended" });
    expect(attended).toHaveLength(2);
    expect((attended[0] as HTMLButtonElement).disabled).toBe(false);
    expect((attended[1] as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows no buttons to an admin who can only read the queue", async () => {
    renderPanel(["queue:read"]);
    await screen.findByText("Fox Night");
    expect(screen.queryByRole("button", { name: "Attended" })).toBeNull();
    expect(screen.queryByRole("button", { name: "No-show" })).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeaderboardView } from "@/features/gamification/components/leaderboard/LeaderboardView";
import * as useLeaderboardDataHook from "@/features/gamification/hooks/useLeaderboardData";
import type { FoxerLeaderboardResponse } from "@/shared/api/leaderboard";

const mockFoxerData: FoxerLeaderboardResponse = {
  tab: "top_rated",
  userPosition: {
    userId: "f-9",
    position: 12,
    name: "Current Dev",
    avatarUrl: null,
    role: "venueFoxer",
    city: "Taguig",
    starRating: 4.5,
    reviewCount: 8,
    completedBookings: 9,
  },
  entries: [
    {
      userId: "f-1",
      position: 1,
      name: "Metro Audio Pro",
      avatarUrl: null,
      role: "providerFoxer",
      city: "Manila",
      starRating: 4.95,
      reviewCount: 42,
      completedBookings: 60,
    },
    {
      userId: "f-2",
      position: 2,
      name: "The Loft Studio",
      avatarUrl: null,
      role: "venueFoxer",
      city: "Taguig",
      starRating: 4.88,
      reviewCount: 28,
      completedBookings: 35,
    },
  ],
};

const foxerQuery = (overrides: Record<string, unknown>) =>
  vi.spyOn(useLeaderboardDataHook, "useFoxerLeaderboard").mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as any);

describe("LeaderboardView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the Foxer leaderboard only: no citizen board, levels or ranks", () => {
    foxerQuery({ data: mockFoxerData });

    render(<LeaderboardView />);

    expect(screen.getByText("Top Foxers")).toBeDefined();
    expect(screen.queryByText("Top Citizens")).toBeNull();
    expect(screen.queryByText(/LVL/)).toBeNull();
    expect(screen.queryByText(/Citizen Standing/)).toBeNull();

    expect(screen.getByText("Metro Audio Pro")).toBeDefined();
    expect(screen.getByText("The Loft Studio")).toBeDefined();
    expect(screen.getByText("4.9")).toBeDefined();
    expect(screen.getByText("42 reviews")).toBeDefined();
    expect(screen.getByText(/60 bookings completed/)).toBeDefined();
    expect(screen.getByText("🥇")).toBeDefined();

    expect(screen.getByText("Your Foxer Standing")).toBeDefined();
    expect(screen.getByText("Current Dev (You)")).toBeDefined();
    expect(screen.getByText("#12")).toBeDefined();
  });

  it("switches tabs", () => {
    const spy = foxerQuery({ data: mockFoxerData });

    render(<LeaderboardView />);
    fireEvent.click(screen.getByText("Most Booked"));

    expect(spy).toHaveBeenLastCalledWith("most_booked", "", "");
  });

  it("displays loading skeleton during query load", () => {
    foxerQuery({ isLoading: true });

    const { container } = render(<LeaderboardView />);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("displays error state and retries on click", () => {
    const mockRefetch = vi.fn();
    foxerQuery({ isError: true, refetch: mockRefetch });

    render(<LeaderboardView />);

    expect(screen.getByText("Failed to load leaderboard")).toBeDefined();
    fireEvent.click(screen.getByText("Retry"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

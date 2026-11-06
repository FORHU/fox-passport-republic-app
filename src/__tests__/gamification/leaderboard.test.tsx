import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeaderboardView } from "@/features/gamification/components/leaderboard/LeaderboardView";
import * as useLeaderboardDataHook from "@/features/gamification/hooks/useLeaderboardData";
import type {
  CitizenLeaderboardResponse,
  FoxerLeaderboardResponse,
} from "@/shared/api/leaderboard";

const mockCitizenData: CitizenLeaderboardResponse = {
  tab: "this_month",
  season: "2026-11",
  entries: [
    {
      userId: "u-1",
      position: 1,
      name: "Reign Mark",
      avatarUrl: null,
      level: 18,
      rankTitle: "Fox Baron",
      city: "Manila",
    },
    {
      userId: "u-2",
      position: 2,
      name: "Alice Walker",
      avatarUrl: null,
      level: 12,
      rankTitle: "Master Foxer",
      city: "Quezon City",
    },
    {
      userId: "u-3",
      position: 3,
      name: "Charlie Fox",
      avatarUrl: null,
      level: 7,
      rankTitle: "Apprentice",
      city: "Makati",
    },
  ],
  userPosition: {
    userId: "u-99",
    position: 42,
    name: "Current Dev",
    avatarUrl: null,
    level: 5,
    rankTitle: "Resident",
    city: "Taguig",
  },
};

const mockFoxerData: FoxerLeaderboardResponse = {
  tab: "top_rated",
  userPosition: null,
  entries: [
    {
      userId: "f-1",
      position: 1,
      name: "Metro Audio Pro",
      avatarUrl: null,
      role: "gearFoxer",
      city: "Manila",
      starRating: 4.95,
      reviewCount: 42,
      completedBookings: 60,
      rankTitle: "Top Rated",
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
      rankTitle: "Super Foxer",
    },
  ],
};

describe("LeaderboardView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders citizen leaderboard by default with podium medals, names, and levels", () => {
    vi.spyOn(useLeaderboardDataHook, "useCitizenLeaderboard").mockReturnValue({
      data: mockCitizenData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useLeaderboardDataHook, "useFoxerLeaderboard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<LeaderboardView />);

    expect(screen.getByText("Top Citizens")).toBeDefined();
    expect(screen.getByText("Top Foxers")).toBeDefined();
    expect(screen.getByText("Reign Mark")).toBeDefined();
    expect(screen.getByText("Alice Walker")).toBeDefined();
    expect(screen.getByText("Charlie Fox")).toBeDefined();
    expect(screen.getByText("Season: 2026-11")).toBeDefined();

    // Check medals and level tags
    expect(screen.getByText("🥇")).toBeDefined();
    expect(screen.getByText("🥈")).toBeDefined();
    expect(screen.getByText("🥉")).toBeDefined();
    expect(screen.getByText("LVL 18")).toBeDefined();

    // Check pinned user standing
    expect(screen.getByText("Your Citizen Standing")).toBeDefined();
    expect(screen.getByText("Current Dev (You)")).toBeDefined();
    expect(screen.getByText("#42")).toBeDefined();
  });

  it("switches to Foxer leaderboard when clicking Top Foxers tab", () => {
    vi.spyOn(useLeaderboardDataHook, "useCitizenLeaderboard").mockReturnValue({
      data: mockCitizenData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useLeaderboardDataHook, "useFoxerLeaderboard").mockReturnValue({
      data: mockFoxerData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<LeaderboardView />);

    const foxersButton = screen.getByText("Top Foxers");
    fireEvent.click(foxersButton);

    expect(screen.getByText("Metro Audio Pro")).toBeDefined();
    expect(screen.getByText("The Loft Studio")).toBeDefined();
    expect(screen.getByText("4.9")).toBeDefined();
    expect(screen.getByText("42 reviews")).toBeDefined();
    expect(screen.getByText(/60 bookings completed/)).toBeDefined();
  });

  it("displays loading skeleton during query load", () => {
    vi.spyOn(useLeaderboardDataHook, "useCitizenLeaderboard").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useLeaderboardDataHook, "useFoxerLeaderboard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { container } = render(<LeaderboardView />);
    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("displays error state and retries on click", () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useLeaderboardDataHook, "useCitizenLeaderboard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    vi.spyOn(useLeaderboardDataHook, "useFoxerLeaderboard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<LeaderboardView />);

    expect(screen.getByText("Failed to load leaderboard")).toBeDefined();
    const retryButton = screen.getByText("Retry");
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

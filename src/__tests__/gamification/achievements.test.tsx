import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementsView } from "@/features/gamification/components/achievements/AchievementsView";
import * as useAchievementsHook from "@/features/gamification/hooks/useAchievements";
import type { UserAchievementsResponse } from "@/shared/api/achievements";

const mockAchievementsData: UserAchievementsResponse = {
  totalUnlockedTiers: 4,
  completedAchievements: 1,
  citizenAchievements: [
    {
      key: "regular",
      name: "Regular",
      description: "Attend events across the Republic",
      category: "citizen",
      currentCount: 15,
      currentTier: 2,
      nextTier: 3,
      targetCount: 50,
      progressPercentage: 30,
      isCompleted: false,
      tiers: [
        {
          tier: 1,
          target: 1,
          xp: 50,
          coins: 25,
          isUnlocked: true,
        },
        {
          tier: 2,
          target: 10,
          xp: 150,
          coins: 75,
          isUnlocked: true,
        },
        {
          tier: 3,
          target: 50,
          xp: 400,
          coins: 200,
          badgeName: "Regular",
          isUnlocked: false,
        },
      ],
    },
    {
      key: "storyteller",
      name: "Storyteller",
      description: "Publish engaging posts on the Republic feed",
      category: "citizen",
      currentCount: 5,
      currentTier: 1,
      nextTier: 2,
      targetCount: 25,
      progressPercentage: 20,
      isCompleted: false,
      tiers: [
        {
          tier: 1,
          target: 5,
          xp: 50,
          coins: 0,
          isUnlocked: true,
        },
        {
          tier: 2,
          target: 25,
          xp: 150,
          coins: 0,
          isUnlocked: false,
        },
        {
          tier: 3,
          target: 100,
          xp: 400,
          coins: 0,
          badgeName: "Storyteller",
          isUnlocked: false,
        },
      ],
    },
  ],
  foxerAchievements: [
    {
      key: "open_for_business",
      name: "Open for Business",
      description: "Maintain published listings for venues, gear, or services",
      category: "foxer",
      currentCount: 25,
      currentTier: 3,
      nextTier: null,
      targetCount: 25,
      progressPercentage: 100,
      isCompleted: true,
      tiers: [
        {
          tier: 1,
          target: 1,
          xp: 50,
          coins: 25,
          isUnlocked: true,
        },
        {
          tier: 2,
          target: 5,
          xp: 150,
          coins: 75,
          isUnlocked: true,
        },
        {
          tier: 3,
          target: 25,
          xp: 400,
          coins: 200,
          badgeName: "Open for Business",
          isUnlocked: true,
        },
      ],
    },
  ],
};

describe("AchievementsView component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton during data fetch", () => {
    vi.spyOn(useAchievementsHook, "useAchievements").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { container } = render(<AchievementsView />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders error state with retry button when query fails", () => {
    const mockRefetch = vi.fn();
    vi.spyOn(useAchievementsHook, "useAchievements").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<AchievementsView />);
    expect(screen.getByText("Failed to load achievements")).toBeTruthy();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("renders overview metrics and citizen achievements by default", () => {
    vi.spyOn(useAchievementsHook, "useAchievements").mockReturnValue({
      data: mockAchievementsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AchievementsView />);
    expect(screen.getByText(/Unlocked Tiers/i)).toBeTruthy();
    expect(screen.getByText("Regular")).toBeTruthy();
    expect(screen.getByText("Storyteller")).toBeTruthy();

    // Check tier badge
    expect(screen.getByText("TIER 2")).toBeTruthy();

    // Check social milestone guardrail text
    expect(
      screen.getByText(/Social milestone: awards XP & badges only/i),
    ).toBeTruthy();
  });

  it("switches to Foxer achievements tab and renders Foxer cards", () => {
    vi.spyOn(useAchievementsHook, "useAchievements").mockReturnValue({
      data: mockAchievementsData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AchievementsView />);

    const foxerTab = screen.getByRole("button", {
      name: /Foxer Achievements/i,
    });
    fireEvent.click(foxerTab);

    expect(screen.getByText("Open for Business")).toBeTruthy();
    expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
  });
});

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VenueReviews } from "@/features/venue/components/detail/VenueExtras";
import WriteReviewClient from "@/features/review/components/WriteReviewClient";

const mockGetReviewsByListing = vi.fn();
const mockToggleHelpfulVote = vi.fn();
const mockPostReviewReply = vi.fn();
const mockSubmitReview = vi.fn();

vi.mock("@/shared/api/reviews", () => ({
  getReviewsByListing: (...args: unknown[]) => mockGetReviewsByListing(...args),
  toggleHelpfulVote: (...args: unknown[]) => mockToggleHelpfulVote(...args),
  postReviewReply: (...args: unknown[]) => mockPostReviewReply(...args),
  submitReview: (...args: unknown[]) => mockSubmitReview(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (
    selector: (s: { user: { id: string; name: string } }) => unknown,
  ) => selector({ user: { id: "voter-1", name: "Citizen Voter" } }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Review Sub-Ratings, Helpful Votes & Sorting UI (§9.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sub-rating averages, sort selector, and helpful vote button on VenueReviews", async () => {
    mockGetReviewsByListing.mockResolvedValue({
      reviews: [
        {
          id: "rev-1",
          rating: 5,
          comment: "Superb lighting and helpful venue team!",
          userId: "author-1",
          user: { name: "Alex Reviewer" },
          quality: 5,
          communication: 4,
          value: 5,
          punctuality: 5,
          helpfulCount: 4,
          createdAt: "2026-11-01T00:00:00.000Z",
          replies: [],
        },
      ],
      ratingDistribution: { 5: "100%", 4: "0%", 3: "0%", 2: "0%", 1: "0%" },
      subRatingAverages: {
        quality: 4.8,
        communication: 4.4,
        value: 4.9,
        punctuality: 5.0,
      },
    });
    mockToggleHelpfulVote.mockResolvedValue({
      helpful: true,
      helpfulCount: 5,
    });

    renderWithQuery(<VenueReviews venueId="venue-123" />);

    await waitFor(() => {
      expect(
        screen.getByText("Superb lighting and helpful venue team!"),
      ).toBeDefined();
    });

    // Sub-rating averages breakdown
    expect(screen.getByTestId("subrating-averages")).toBeDefined();
    expect(screen.getByText("4.8")).toBeDefined();
    expect(screen.getByText("4.4")).toBeDefined();
    expect(screen.getByText("4.9")).toBeDefined();

    // Helpful button click triggers toggleHelpfulVote
    const helpfulBtn = await screen.findByRole("button", {
      name: "Helpful (4)",
    });
    fireEvent.click(helpfulBtn);
    await waitFor(() => {
      expect(mockToggleHelpfulVote).toHaveBeenCalledWith("rev-1");
    });

    // Sort buttons
    const recentBtn = screen.getByRole("button", { name: "Recent" });
    fireEvent.click(recentBtn);
    await waitFor(() => {
      expect(mockGetReviewsByListing).toHaveBeenCalledWith(
        "venue-123",
        "recent",
      );
    });
  });

  it("submits optional sub-ratings in WriteReviewClient", async () => {
    mockSubmitReview.mockResolvedValue({ id: "rev-202", rating: 5 });

    renderWithQuery(
      <WriteReviewClient
        booking={{
          id: "booking-99",
          venueId: "venue-123",
          targetType: "venue",
          venueName: "Grand Fox Hall",
        }}
      />,
    );

    // Select overall 5-star rating (first 5 buttons in main star rating)
    const qualityFiveStar = screen.getByRole("button", {
      name: "Quality 5 stars",
    });
    const commFourStar = screen.getByRole("button", {
      name: "Communication 4 stars",
    });
    fireEvent.click(qualityFiveStar);
    fireEvent.click(commFourStar);

    // Click overall 5-star button (the 5th button before subratings)
    const allButtons = screen.getAllByRole("button");
    // Button 0 is Back, Buttons 1..5 are overall stars 1..5
    fireEvent.click(allButtons[5]);

    const textarea = screen.getByPlaceholderText(
      /Tell others about your experience/i,
    );
    fireEvent.change(textarea, {
      target: {
        value:
          "An unforgettable evening with top-tier acoustics and smooth check-in.",
      },
    });

    const submitBtn = screen.getByRole("button", { name: "Submit Review" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: "booking-99",
          rating: 5,
          quality: 5,
          communication: 4,
          targetId: "venue-123",
          targetType: "venue",
        }),
      );
    });
  });
});

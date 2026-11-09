import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VenueReviews } from "@/features/venue/components/detail/VenueExtras";
import { VenueHero } from "@/features/venue/components/detail/VenueHeader";
import { BookingWidget } from "@/features/venue/components/detail/BookingWidget";
import { summarizeReviews } from "@/features/venue/hooks/useVenueReviewSummary";

/**
 * Whether a venue is rated comes from its review count, not from its rating:
 * no reviews is "New", while a real review of 0 still shows 0.
 */

const mockGetReviewsByListing = vi.fn();

vi.mock("@/shared/api/reviews", () => ({
  getReviewsByListing: (...args: unknown[]) => mockGetReviewsByListing(...args),
  toggleHelpfulVote: vi.fn(),
  postReviewReply: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/shared/auth/useAuthStore", () => ({
  useAuthStore: (selector: (s: { user: null }) => unknown) =>
    selector({ user: null }),
}));

function review(id: string, rating: number) {
  return {
    id,
    rating,
    comment: `Review ${id}`,
    userId: `user-${id}`,
    user: { name: `Guest ${id}` },
    createdAt: "2026-11-01T00:00:00.000Z",
    replies: [],
  };
}

function respondWith(reviews: ReturnType<typeof review>[]) {
  mockGetReviewsByListing.mockResolvedValue({
    reviews,
    ratingDistribution: {},
    subRatingAverages: {
      quality: null,
      communication: null,
      value: null,
      punctuality: null,
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("summarizeReviews", () => {
  it("has no average when there are no reviews", () => {
    expect(summarizeReviews([])).toEqual({ count: 0, average: null });
  });

  it("keeps a real 0 rating as an average of 0", () => {
    expect(summarizeReviews([{ rating: 0 }])).toEqual({ count: 1, average: 0 });
  });

  it("averages to one decimal place", () => {
    expect(summarizeReviews([{ rating: 5 }, { rating: 4 }])).toEqual({
      count: 2,
      average: 4.5,
    });
  });
});

describe("VenueReviews rating header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "New" with no star rating or Guest favorite when there are no reviews', async () => {
    respondWith([]);
    renderWithQuery(
      <VenueReviews venueId="tagaytay-villa" rating={0} totalReviews={0} />,
    );

    expect(await screen.findByText("New")).toBeDefined();
    expect(screen.getByText("No reviews yet")).toBeDefined();
    expect(screen.queryByText("Guest favorite")).toBeNull();
    expect(screen.queryByText("star")).toBeNull();
    expect(screen.queryByText("0 reviews")).toBeNull();
    expect(screen.queryByText("0%")).toBeNull();
  });

  it("shows a real 0 rating normally", async () => {
    respondWith([review("a", 0)]);
    renderWithQuery(<VenueReviews venueId="venue-zero" />);

    expect(await screen.findByText("Guest favorite")).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "0" })).toBeDefined();
    expect(screen.getByText("1 review")).toBeDefined();
    expect(screen.queryByText("New")).toBeNull();
  });

  it("shows the average and count of the venue's reviews", async () => {
    respondWith([review("a", 5), review("b", 4)]);
    renderWithQuery(<VenueReviews venueId="venue-rated" />);

    expect(
      await screen.findByRole("heading", { level: 2, name: "4.5" }),
    ).toBeDefined();
    expect(screen.getByText("Guest favorite")).toBeDefined();
    expect(screen.getByText("2 reviews")).toBeDefined();
  });

  it('does not flash "New" while the reviews load', async () => {
    mockGetReviewsByListing.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<VenueReviews venueId="venue-loading" />);

    await waitFor(() => expect(mockGetReviewsByListing).toHaveBeenCalled());
    expect(screen.queryByText("New")).toBeNull();
    expect(screen.queryByText("Guest favorite")).toBeNull();
  });
});

describe("VenueHero rating", () => {
  const base = {
    title: "Tagaytay Villa",
    location: "Tagaytay",
    province: "Cavite",
  };

  it('shows "New" for a venue with no reviews', () => {
    render(<VenueHero {...base} rating={null} reviews={0} />);
    expect(screen.getByText("New")).toBeDefined();
    expect(screen.queryByText("star")).toBeNull();
    expect(screen.queryByText(/reviews?$/)).toBeNull();
  });

  it("shows no rating while the count loads", () => {
    render(<VenueHero {...base} rating={null} />);
    expect(screen.queryByText("New")).toBeNull();
    expect(screen.queryByText("star")).toBeNull();
  });

  it("shows the rating and count of a reviewed venue", () => {
    render(<VenueHero {...base} rating={4.7} reviews={3} />);
    expect(screen.getByText("4.7")).toBeDefined();
    expect(screen.getByText("3 reviews")).toBeDefined();
    expect(screen.queryByText("New")).toBeNull();
  });
});

describe("BookingWidget rating", () => {
  const base = { venueId: "v1", price: 1000, onContactOwner: vi.fn() };

  it('shows "New" for a venue with no reviews', () => {
    render(<BookingWidget {...base} rating={null} reviews={0} />);
    expect(screen.getByText("New")).toBeDefined();
    expect(screen.queryByText(/\d+ reviews?$/)).toBeNull();
  });

  it("shows no rating while the count loads", () => {
    render(<BookingWidget {...base} rating={null} />);
    expect(screen.queryByText("New")).toBeNull();
    expect(screen.queryByText(/\d+ reviews?$/)).toBeNull();
  });

  it("shows the rating and count of a reviewed venue", () => {
    render(<BookingWidget {...base} rating={4.7} reviews={1} />);
    expect(screen.getByText(/4\.7/)).toBeDefined();
    expect(screen.getByText("1 review")).toBeDefined();
  });
});

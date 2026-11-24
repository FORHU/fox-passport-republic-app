import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { smartBack } from "@/shared/lib/navigation";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VenueNavHeader } from "@/features/venue/components/detail/VenueHeader";

vi.mock("next/image", () => ({
  default: ({ alt, priority: _priority, ...props }: any) => (
    <img src="mock.png" alt={alt ?? ""} {...props} />
  ),
}));

vi.mock("@/shared/hooks/useFavorites", () => ({
  useFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: vi.fn(),
    isToggling: false,
  }),
}));

describe("smartBack Navigation Utility (app#408)", () => {
  let mockRouter: { back: any; push: any };

  beforeEach(() => {
    mockRouter = {
      back: vi.fn(),
      push: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("closes the window if opened via window.opener in a new tab/popup", () => {
    const closeSpy = vi.fn();
    Object.defineProperty(window, "opener", { value: {}, writable: true, configurable: true });
    Object.defineProperty(window, "close", { value: closeSpy, writable: true, configurable: true });
    Object.defineProperty(window.history, "length", { value: 1, writable: true, configurable: true });

    smartBack(mockRouter as any, "/creator-dashboard");

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("calls router.back() when history length > 1 and referrer is on the same site", () => {
    Object.defineProperty(window, "opener", { value: null, writable: true, configurable: true });
    Object.defineProperty(window.history, "length", { value: 3, writable: true, configurable: true });
    Object.defineProperty(document, "referrer", {
      value: "http://localhost:3000/creator-dashboard",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
      configurable: true,
    });

    smartBack(mockRouter as any, "/creator-dashboard");

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("calls router.push(fallback) when opened directly with history length 1", () => {
    Object.defineProperty(window, "opener", { value: null, writable: true, configurable: true });
    Object.defineProperty(window.history, "length", { value: 1, writable: true, configurable: true });
    Object.defineProperty(document, "referrer", { value: "", writable: true, configurable: true });

    smartBack(mockRouter as any, "/creator-dashboard/venues/test-id/edit");

    expect(mockRouter.push).toHaveBeenCalledWith("/creator-dashboard/venues/test-id/edit");
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("calls router.push(fallback) when referrer is from an external site", () => {
    Object.defineProperty(window, "opener", { value: null, writable: true, configurable: true });
    Object.defineProperty(window.history, "length", { value: 2, writable: true, configurable: true });
    Object.defineProperty(document, "referrer", {
      value: "https://www.google.com/search",
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
      configurable: true,
    });

    smartBack(mockRouter as any, "/venues/map");

    expect(mockRouter.push).toHaveBeenCalledWith("/venues/map");
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});

describe("VenueNavHeader Back Button (app#408)", () => {
  it("triggers onBack callback when clicked", () => {
    const handleBack = vi.fn();
    render(
      <VenueNavHeader
        title="Test Venue"
        venueId="venue-123"
        onBack={handleBack}
      />
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);

    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const favorites = vi.hoisted(() => ({
  saved: false,
  toggleFavorite: vi.fn(),
}));
vi.mock("@/shared/hooks/useFavorites", () => ({
  useFavorites: () => ({
    isFavorited: () => favorites.saved,
    toggleFavorite: favorites.toggleFavorite,
    isToggling: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { VenueNavHeader } from "@/features/venue/components/detail/VenueHeader";

const renderHeader = () =>
  render(<VenueNavHeader title="Villa" venueId="v1" onBack={() => {}} />);

describe("VenueNavHeader Share", () => {
  const originalShare = navigator.share;
  const originalClipboard = navigator.clipboard;

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    Object.defineProperty(navigator, "share", {
      value: originalShare,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
  });

  it("copies the link and says so when the browser has no share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Link copied"));
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it("opens the native share sheet when there is one, and stays quiet on cancel", async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("cancelled", "AbortError"));
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });

    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "Villa",
        url: window.location.href,
      }),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe("VenueNavHeader Save", () => {
  beforeEach(() => vi.clearAllMocks());

  it("toggles the venue's favorite and confirms on success", () => {
    favorites.saved = false;
    favorites.toggleFavorite.mockImplementation((_id, opts) => opts?.onSuccess?.());

    renderHeader();
    const save = screen.getByRole("button", { name: "Save" });
    expect(save).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(save);

    expect(favorites.toggleFavorite).toHaveBeenCalledWith("v1", expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith("Saved to wishlist");
  });

  it("shows the saved state", () => {
    favorites.saved = true;
    renderHeader();
    const saved = screen.getByRole("button", { name: "Saved" });
    expect(saved).toHaveAttribute("aria-pressed", "true");
  });
});

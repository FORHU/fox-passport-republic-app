import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { VenueListingDetailsForm } from "@/features/venue/components/VenueListingDetailsForm";

/**
 * What an Organizer may change on a Venue — its description and photos, never
 * its name, capacity or prices (the API's ADR 0005). The form must send only
 * what was actually changed, so it never re-submits a Mayor-only field the
 * API would refuse.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.hoisted(() => ({
  fetchVenueById: vi.fn(),
  updateVenue: vi.fn(),
}));
vi.mock("@/features/venue/api/venues", () => api);

vi.mock("@/shared/components/layout/FileUploader", () => ({
  default: ({
    label,
    onUploadComplete,
  }: {
    label: string;
    onUploadComplete: (id: string) => void;
  }) =>
    createElement(
      "button",
      { type: "button", onClick: () => onUploadComplete("new-photo") },
      label,
    ),
}));

const VENUE = {
  id: "v1",
  name: "Sky Hall",
  price: 5000,
  capacity: 200,
  description: "A rooftop hall.",
  amenities: ["Wi-Fi"],
  facilities: [],
  parkingInformation: "",
  accessibilityInformation: "",
  entranceInstructions: "",
  images: [
    { id: "p1", url: "https://example.com/1.jpg" },
    { id: "p2", url: "https://example.com/2.jpg" },
  ],
};

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(VenueListingDetailsForm, { venueId: "v1" }),
    ),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  api.fetchVenueById.mockResolvedValue(VENUE);
  api.updateVenue.mockResolvedValue(VENUE);
});

describe("VenueListingDetailsForm", () => {
  it("offers nothing that belongs to the Mayor", async () => {
    renderForm();
    await screen.findByLabelText("Description");
    for (const label of [/price/i, /capacity/i, /^name$/i, /rate/i]) {
      expect(screen.queryByLabelText(label)).toBeNull();
    }
  });

  it("cannot save until something has changed", async () => {
    renderForm();
    await screen.findByLabelText("Description");
    const save = screen.getByRole("button", { name: /save changes/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);
  });

  it("sends only the fields that changed", async () => {
    renderForm();
    fireEvent.change(await screen.findByLabelText("Description"), {
      target: { value: "A rooftop hall with a garden terrace." },
    });
    fireEvent.change(screen.getByLabelText("Amenities"), {
      target: { value: "Wi-Fi, Projector" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(api.updateVenue).toHaveBeenCalledWith("v1", {
        description: "A rooftop hall with a garden terrace.",
        amenities: ["Wi-Fi", "Projector"],
      }),
    );
  });

  it("sends the whole photo list when photos change, kept and new", async () => {
    renderForm();
    await screen.findByLabelText("Description");
    fireEvent.click(screen.getAllByRole("button", { name: "Remove photo" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Add a photo" }));
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(api.updateVenue).toHaveBeenCalledWith("v1", {
        imgIds: ["p2", "new-photo"],
      }),
    );
  });
});

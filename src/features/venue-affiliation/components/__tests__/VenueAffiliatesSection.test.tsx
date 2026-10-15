import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { VenueAffiliatesSection } from "@/features/venue-affiliation/components/VenueAffiliatesSection";

/**
 * A venue's Organizers decide Event Foxers' applications, but inviting,
 * withdrawing, revoking — and approving one that sets a price — stay the
 * mayor's (the API's ADR 0005). The Organizer's view offers none of those.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.hoisted(() => ({
  fetchVenueAffiliates: vi.fn(),
  approveAffiliation: vi.fn(),
  rejectAffiliation: vi.fn(),
  inviteEventFoxer: vi.fn(),
  cancelAffiliation: vi.fn(),
  revokeAffiliation: vi.fn(),
}));
vi.mock("@/features/venue-affiliation/api/venueAffiliations", () => api);
vi.mock("@/features/search/api/search", () => ({
  searchEventFoxers: vi.fn(),
}));
vi.mock("@/features/venue-affiliation/components/EntitySearchPicker", () => ({
  EntitySearchPicker: () => createElement("div", null, "foxer-picker"),
}));

const application = (id: string, name: string, agreedPrice: number | null) => ({
  id,
  venueId: "v1",
  eventFoxerId: `ef-${id}`,
  initiatedBy: "eventFoxer",
  status: "pending",
  permissions: [],
  agreedPrice,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
  eventFoxer: { id: `ef-${id}`, name },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VenueAffiliatesSection as an Organizer", () => {
  it("offers no way to invite", async () => {
    api.fetchVenueAffiliates.mockResolvedValue([]);
    render(createElement(VenueAffiliatesSection, { venueId: "v1", asOrganizer: true }));
    await screen.findByText(/no one has applied/i);
    expect(screen.queryByText("foxer-picker")).toBeNull();
    expect(screen.queryByRole("button", { name: "Invite" })).toBeNull();
  });

  it("lets them approve or reject an application at the standard price", async () => {
    api.fetchVenueAffiliates.mockResolvedValue([application("a1", "Juan", null)]);
    render(createElement(VenueAffiliatesSection, { venueId: "v1", asOrganizer: true }));
    await screen.findByText("Juan");
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
  });

  it("leaves approving a priced application to the mayor, but can reject it", async () => {
    api.fetchVenueAffiliates.mockResolvedValue([application("a2", "Rosa", 5000)]);
    render(createElement(VenueAffiliatesSection, { venueId: "v1", asOrganizer: true }));
    await screen.findByText("Rosa");
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
    expect(screen.getByText("Mayor approves")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
  });

  it("offers no revoke on an approved affiliation", async () => {
    api.fetchVenueAffiliates.mockResolvedValue([
      { ...application("a3", "Lito", null), status: "approved" },
    ]);
    render(createElement(VenueAffiliatesSection, { venueId: "v1", asOrganizer: true }));
    await screen.findByText("Lito");
    expect(screen.queryByRole("button", { name: "Revoke" })).toBeNull();
  });

  it("still gives the mayor every action", async () => {
    api.fetchVenueAffiliates.mockResolvedValue([
      application("a2", "Rosa", 5000),
      { ...application("a3", "Lito", null), status: "approved" },
    ]);
    render(createElement(VenueAffiliatesSection, { venueId: "v1" }));
    await screen.findByText("Rosa");
    expect(screen.getByText("foxer-picker")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Revoke" })).toBeTruthy();
  });
});

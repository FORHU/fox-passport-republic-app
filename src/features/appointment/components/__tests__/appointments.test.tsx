import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactElement } from "react";
import { TeamPanel } from "@/features/appointment/components/TeamPanel";
import { OrganizingSection } from "@/features/appointment/components/OrganizingSection";

/**
 * The two sides of an Appointment (CONTEXT.md; the API's ADR 0005): the Mayor
 * or Event Owner managing their team, and the appointed person answering
 * invitations and leaving teams. These render against a mocked API and check
 * what a person would actually see and send.
 */

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const api = vi.hoisted(() => ({
  fetchTeam: vi.fn(),
  appoint: vi.fn(),
  removeFromTeam: vi.fn(),
  fetchMyAppointments: vi.fn(),
  acceptAppointment: vi.fn(),
  declineAppointment: vi.fn(),
  leaveAppointment: vi.fn(),
  fetchTeamSettings: vi.fn(),
  updateTeamSettings: vi.fn(),
  approveRequest: vi.fn(),
  declineRequest: vi.fn(),
  withdrawRequest: vi.fn(),
  searchOrganizers: vi.fn(),
  fetchJoinStatus: vi.fn(),
  requestToJoin: vi.fn(),
  fetchOpenToOrganizers: vi.fn(),
}));
vi.mock("@/features/appointment/api/appointments", () => api);

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(createElement(QueryClientProvider, { client }, ui));
}

const person = (name: string) => ({
  id: name,
  name,
  email: `${name.toLowerCase()}@example.com`,
});

const member = (overrides: Record<string, unknown>) => ({
  id: "a1",
  kind: "organizer",
  state: "active",
  eventId: null,
  venueId: "v1",
  userId: "ben",
  permissions: [],
  expiresAt: null,
  respondedAt: "2026-09-01T00:00:00Z",
  endedAt: null,
  endReason: null,
  createdAt: "2026-09-01T00:00:00Z",
  appointedBy: person("Maria"),
  user: person("Ben"),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  api.fetchTeamSettings.mockResolvedValue({ acceptsOrganizerRequests: false });
  api.searchOrganizers.mockResolvedValue([]);
});

describe("TeamPanel", () => {
  const venue = { type: "venue" as const, id: "v1" };

  it("explains why nothing can be added before there is anything to add to", () => {
    renderWithQuery(
      createElement(TeamPanel, {
        target: null,
        unavailableMessage: "Once this event is booked and scheduled.",
      }),
    );
    expect(
      screen.getByText("Once this event is booked and scheduled."),
    ).toBeTruthy();
    expect(screen.queryByPlaceholderText("Their email address")).toBeNull();
  });

  it("invites an Organizer by default", async () => {
    api.fetchTeam.mockResolvedValue([]);
    api.appoint.mockResolvedValue(member({}));
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    fireEvent.change(screen.getByPlaceholderText(/search organizers/i), {
      target: { value: "ben@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    await waitFor(() =>
      expect(api.appoint).toHaveBeenCalledWith(venue, {
        kind: "organizer",
        email: "ben@example.com",
      }),
    );
  });

  it("adds a Check-in Helper when that is chosen", async () => {
    api.fetchTeam.mockResolvedValue([]);
    api.appoint.mockResolvedValue(member({ kind: "check_in_helper" }));
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    fireEvent.click(screen.getByRole("radio", { name: "Check-in Helper" }));
    fireEvent.change(screen.getByPlaceholderText("Their email address"), {
      target: { value: "lea@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add helper/i }));

    await waitFor(() =>
      expect(api.appoint).toHaveBeenCalledWith(venue, {
        kind: "check_in_helper",
        email: "lea@example.com",
      }),
    );
  });

  it("separates the team from invitations still waiting for an answer", async () => {
    api.fetchTeam.mockResolvedValue([
      member({ id: "a1", user: person("Ben") }),
      member({
        id: "a2",
        state: "invited",
        user: person("Sam"),
        expiresAt: "2026-10-08T00:00:00Z",
      }),
    ]);
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    expect(await screen.findByText("On the team")).toBeTruthy();
    expect(screen.getByText("Waiting for an answer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Ben" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Withdraw Sam" })).toBeTruthy();
  });

  it("removes someone from the team", async () => {
    api.fetchTeam.mockResolvedValue([member({ id: "a1" })]);
    api.removeFromTeam.mockResolvedValue(undefined);
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    fireEvent.click(await screen.findByRole("button", { name: "Remove Ben" }));
    await waitFor(() =>
      expect(api.removeFromTeam).toHaveBeenCalledWith(venue, "a1"),
    );
  });

  it("keeps past members out of the way until asked for", async () => {
    api.fetchTeam.mockResolvedValue([
      member({ id: "a3", state: "ended", endReason: "left", user: person("Old") }),
    ]);
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    const toggle = await screen.findByRole("button", { name: /past \(1\)/i });
    expect(screen.queryByText("Old")).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText("Old")).toBeTruthy();
  });
});

describe("OrganizingSection", () => {
  const invitation = {
    ...member({ id: "inv1", state: "invited", expiresAt: "2026-10-08T00:00:00Z" }),
    event: {
      id: "ev1",
      name: "Jazz Night",
      startAt: "2026-10-10T18:00:00Z",
      endAt: "2026-10-10T23:00:00Z",
      eventStatus: "pending",
    },
    venue: null,
    appointedBy: person("Juan"),
  };
  const team = {
    ...member({ id: "t1" }),
    event: null,
    venue: { id: "v1", name: "Sky Hall", city: "Cebu" },
    appointedBy: person("Maria"),
  };

  it("shows nothing to someone who organizes nothing", async () => {
    api.fetchMyAppointments.mockResolvedValue([]);
    const { container } = renderWithQuery(createElement(OrganizingSection));
    await waitFor(() => expect(api.fetchMyAppointments).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("lets the invited person accept", async () => {
    api.fetchMyAppointments.mockResolvedValue([invitation]);
    api.acceptAppointment.mockResolvedValue(undefined);
    renderWithQuery(createElement(OrganizingSection));

    expect(await screen.findByText("Jazz Night")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    await waitFor(() =>
      expect(api.acceptAppointment).toHaveBeenCalledWith(
        "inv1",
        expect.anything(),
      ),
    );
  });

  it("lets the invited person decline", async () => {
    api.fetchMyAppointments.mockResolvedValue([invitation]);
    api.declineAppointment.mockResolvedValue(undefined);
    renderWithQuery(createElement(OrganizingSection));

    fireEvent.click(await screen.findByRole("button", { name: /decline/i }));
    await waitFor(() =>
      expect(api.declineAppointment).toHaveBeenCalledWith(
        "inv1",
        expect.anything(),
      ),
    );
  });

  it("asks before leaving a team", async () => {
    api.fetchMyAppointments.mockResolvedValue([team]);
    api.leaveAppointment.mockResolvedValue(undefined);
    renderWithQuery(createElement(OrganizingSection));

    fireEvent.click(
      await screen.findByRole("button", { name: "Leave Sky Hall" }),
    );
    expect(api.leaveAppointment).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Leave venue" }));
    await waitFor(() =>
      expect(api.leaveAppointment).toHaveBeenCalledWith(
        "t1",
        expect.anything(),
      ),
    );
  });

  it("points a current team member at the scanner", async () => {
    api.fetchMyAppointments.mockResolvedValue([team]);
    renderWithQuery(createElement(OrganizingSection));

    const link = await screen.findByRole("link", { name: /check in guests/i });
    expect(link.getAttribute("href")).toBe("/creator-dashboard/check-in");
  });
});

describe("OrganizingSection links", () => {
  it("sends a Venue Organizer to the venue page they help run", async () => {
    api.fetchMyAppointments.mockResolvedValue([
      {
        ...member({ id: "t1", kind: "organizer" }),
        event: null,
        venue: { id: "v1", name: "Sky Hall", city: "Cebu" },
        appointedBy: person("Maria"),
      },
    ]);
    renderWithQuery(createElement(OrganizingSection));
    const manage = await screen.findByRole("link", { name: "Manage" });
    expect(manage.getAttribute("href")).toBe(
      "/creator-dashboard/venues/v1/edit",
    );
  });

  it("gives a Check-in Helper no management link", async () => {
    api.fetchMyAppointments.mockResolvedValue([
      {
        ...member({ id: "t2", kind: "check_in_helper" }),
        event: null,
        venue: { id: "v1", name: "Sky Hall", city: "Cebu" },
        appointedBy: person("Maria"),
      },
    ]);
    renderWithQuery(createElement(OrganizingSection));
    await screen.findByText("Sky Hall");
    expect(screen.queryByRole("link", { name: "Manage" })).toBeNull();
  });
});

describe("Organizer requests — the owner's side", () => {
  const venue = { type: "venue" as const, id: "v1" };

  it("turns requests from Organizers on", async () => {
    api.fetchTeam.mockResolvedValue([]);
    api.updateTeamSettings.mockResolvedValue({ acceptsOrganizerRequests: true });
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    const toggle = await screen.findByRole("switch", {
      name: "Accept requests from Organizers",
    });
    await waitFor(() => expect(toggle.getAttribute("aria-checked")).toBe("false"));
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(api.updateTeamSettings).toHaveBeenCalledWith(venue, {
        acceptsOrganizerRequests: true,
      }),
    );
  });

  it("lists requests to join, with Accept and Decline", async () => {
    api.fetchTeam.mockResolvedValue([
      member({ id: "r1", state: "requested", user: person("Rita"), expiresAt: "2026-10-08T00:00:00Z" }),
    ]);
    api.approveRequest.mockResolvedValue(undefined);
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    expect(await screen.findByText("Requests to join")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Accept Rita" }));
    await waitFor(() =>
      expect(api.approveRequest).toHaveBeenCalledWith(venue, "r1"),
    );
  });

  it("finds Organizers by name and invites one", async () => {
    api.fetchTeam.mockResolvedValue([]);
    api.searchOrganizers.mockResolvedValue([
      {
        id: "ben",
        name: "Ben Organizer",
        imgId: null,
        city: "Davao",
        specializations: ["wedding"],
        level: 3,
        totalXP: 2500,
      },
    ]);
    api.appoint.mockResolvedValue(member({}));
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    fireEvent.change(
      await screen.findByPlaceholderText(/search organizers/i),
      { target: { value: "ben" } },
    );
    expect(await screen.findByText("Ben Organizer")).toBeTruthy();
    expect(screen.getByText(/Davao · Wedding/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));
    await waitFor(() =>
      expect(api.appoint).toHaveBeenCalledWith(venue, {
        kind: "organizer",
        email: undefined,
        userId: "ben",
      }),
    );
  });

  it("still invites straight away by email", async () => {
    api.fetchTeam.mockResolvedValue([]);
    api.appoint.mockResolvedValue(member({}));
    renderWithQuery(createElement(TeamPanel, { target: venue }));

    fireEvent.change(
      await screen.findByPlaceholderText(/search organizers/i),
      { target: { value: "ben@example.com" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));
    await waitFor(() =>
      expect(api.appoint).toHaveBeenCalledWith(venue, {
        kind: "organizer",
        email: "ben@example.com",
        userId: undefined,
      }),
    );
    expect(api.searchOrganizers).not.toHaveBeenCalled();
  });
});

describe("Organizer requests — the Organizer's side", () => {
  it("shows a request that is waiting, and lets them withdraw it", async () => {
    api.fetchMyAppointments.mockResolvedValue([
      {
        ...member({ id: "r1", state: "requested", expiresAt: "2026-10-08T00:00:00Z" }),
        event: null,
        venue: { id: "v1", name: "Sky Hall", city: "Cebu" },
        appointedBy: person("Maria"),
      },
    ]);
    api.withdrawRequest.mockResolvedValue(undefined);
    renderWithQuery(createElement(OrganizingSection));

    expect(await screen.findByText(/Waiting for Maria/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Withdraw your request for Sky Hall",
      }),
    );
    await waitFor(() =>
      expect(api.withdrawRequest).toHaveBeenCalledWith("r1", expect.anything()),
    );
  });
});

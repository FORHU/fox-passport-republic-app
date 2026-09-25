import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { createElement } from "react";
import { VenueEditSwitch } from "../VenueEditSwitch";

/**
 * One venue page for everyone who runs the venue: the Mayor gets the full
 * studio, an Organizer only the sections their Appointment allows.
 */

const access = vi.hoisted(() => ({
  value: { isLoading: false, data: null as unknown },
}));
vi.mock("@/features/appointment/hooks/useAppointments", () => ({
  useMyAccess: () => access.value,
}));
vi.mock("@/features/dashboard/components/DashboardHeader", () => ({
  DashboardHeader: () => null,
}));
vi.mock("@/features/venue/components/VenueListingDetailsForm", () => ({
  VenueListingDetailsForm: () => createElement("div", null, "listing-form"),
}));
vi.mock("@/features/venue/components/VenueAvailabilitySection", () => ({
  VenueAvailabilitySection: () => createElement("div", null, "calendar"),
}));
vi.mock(
  "@/features/venue-affiliation/components/VenueAffiliatesSection",
  () => ({
    VenueAffiliatesSection: ({ asOrganizer }: { asOrganizer?: boolean }) =>
      createElement("div", null, `affiliates:${asOrganizer ? "organizer" : "mayor"}`),
  }),
);

const studio = createElement("div", null, "mayor-studio");
// Typed loosely so the studio can go in as createElement's children argument.
const Switch = VenueEditSwitch as unknown as React.FC<{
  venueId: string;
  children?: React.ReactNode;
}>;
const renderSwitch = () =>
  render(createElement(Switch, { venueId: "v1" }, studio));

beforeEach(() => {
  access.value = { isLoading: false, data: null };
});

describe("VenueEditSwitch", () => {
  it("gives the Mayor the full studio", () => {
    access.value = {
      isLoading: false,
      data: { role: "owner", permissions: [] },
    };
    renderSwitch();
    expect(screen.getByText("mayor-studio")).toBeTruthy();
    expect(screen.queryByText("listing-form")).toBeNull();
  });

  it("gives an Organizer only the sections their Appointment allows", () => {
    access.value = {
      isLoading: false,
      data: {
        role: "organizer",
        permissions: [
          "venue:edit-listing",
          "venue:calendar",
          "venue:approve-affiliations",
        ],
      },
    };
    renderSwitch();
    expect(screen.queryByText("mayor-studio")).toBeNull();
    expect(screen.getByText("listing-form")).toBeTruthy();
    expect(screen.getByText("calendar")).toBeTruthy();
    expect(screen.getByText("affiliates:organizer")).toBeTruthy();
  });

  it("leaves out a section the Appointment does not grant", () => {
    access.value = {
      isLoading: false,
      data: { role: "organizer", permissions: ["venue:calendar"] },
    };
    renderSwitch();
    expect(screen.getByText("calendar")).toBeTruthy();
    expect(screen.queryByText("listing-form")).toBeNull();
    expect(screen.queryByText(/affiliates/)).toBeNull();
  });

  it("falls through to the studio for someone who is neither", () => {
    access.value = {
      isLoading: false,
      data: { role: null, permissions: [] },
    };
    renderSwitch();
    // The studio already says "not owned by you" — it stays the one place
    // that message lives.
    expect(screen.getByText("mayor-studio")).toBeTruthy();
  });
});

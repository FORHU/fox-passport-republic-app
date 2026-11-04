import { describe, it, expect } from "vitest";
import { venueConfirmationOf } from "@/features/dashboard/mappers/venueConfirmation";
import { mapTemplateToEventItem } from "@/features/dashboard/mappers/hostDashboard";

/**
 * BUG-20 (app#136): Creator Studio warned "Missing venue confirmation" on
 * every event, because it keyed on a status ("Ongoing") templates never have.
 * The warning now follows the venue rows the API sends.
 */

const direct = { venueId: "v1", matched: false, matchRequestStatus: "pending" };
const matched = (matchRequestStatus: string) => ({
  venueId: "v1",
  matched: true,
  matchRequestStatus,
});

describe("venueConfirmationOf", () => {
  it("is missing with no venue rows", () => {
    expect(venueConfirmationOf({ templateVenues: [] })).toBe("missing");
    expect(venueConfirmationOf({})).toBe("missing");
    expect(venueConfirmationOf(null)).toBe("missing");
  });

  it("is missing when the venue row has no venue picked", () => {
    expect(
      venueConfirmationOf({
        templateVenues: [{ venueId: null, matched: false }],
      }),
    ).toBe("missing");
  });

  it("is confirmed for a venue attached directly, whatever its default match status", () => {
    // The API only lets a venue in directly for its mayor or an organizer
    // with an approved affiliation; matchRequestStatus keeps its default.
    expect(venueConfirmationOf({ templateVenues: [direct] })).toBe("confirmed");
  });

  it("follows the venue owner's answer for a matched venue", () => {
    expect(venueConfirmationOf({ templateVenues: [matched("pending")] })).toBe(
      "pending",
    );
    expect(venueConfirmationOf({ templateVenues: [matched("declined")] })).toBe(
      "declined",
    );
    expect(venueConfirmationOf({ templateVenues: [matched("accepted")] })).toBe(
      "confirmed",
    );
    expect(venueConfirmationOf({ templateVenues: [matched("secured")] })).toBe(
      "confirmed",
    );
  });

  it("ignores optional venue rows", () => {
    expect(
      venueConfirmationOf({
        templateVenues: [direct, { ...matched("declined"), isOptional: true }],
      }),
    ).toBe("confirmed");
    expect(
      venueConfirmationOf({
        templateVenues: [{ ...direct, isOptional: true }],
      }),
    ).toBe("missing");
  });

  it("reports the worst required venue", () => {
    expect(
      venueConfirmationOf({ templateVenues: [direct, matched("pending")] }),
    ).toBe("pending");
    expect(
      venueConfirmationOf({
        templateVenues: [matched("pending"), matched("declined")],
      }),
    ).toBe("declined");
    expect(
      venueConfirmationOf({
        templateVenues: [matched("declined"), { venueId: null }],
      }),
    ).toBe("missing");
  });

  it("uses the API's own value when it sends one (api#165)", () => {
    expect(
      venueConfirmationOf({
        venueConfirmation: "pending",
        templateVenues: [direct],
      }),
    ).toBe("pending");
    // An unknown value is ignored rather than trusted.
    expect(
      venueConfirmationOf({
        venueConfirmation: "maybe",
        templateVenues: [direct],
      }),
    ).toBe("confirmed");
  });
});

describe("mapTemplateToEventItem", () => {
  const template = {
    id: "t1",
    name: "Launch Night",
    status: "PUBLISHED",
    category: "corporate",
    targetCity: "Makati",
    targetState: "Metro Manila",
    maxAttendees: 120,
    createdAt: "2026-10-01T00:00:00.000Z",
    isPublic: true,
    images: [{ url: "a.jpg" }, { url: "b.jpg", isPrimary: true }],
    templateVenues: [direct],
  };

  it("keeps the API status in lower case and adds the venue confirmation", () => {
    const item = mapTemplateToEventItem(template);
    expect(item.status).toBe("published");
    expect(item.venueConfirmation).toBe("confirmed");
  });

  it("maps the template's own fields", () => {
    expect(mapTemplateToEventItem(template)).toMatchObject({
      id: "t1",
      title: "Launch Night",
      loc: "Makati, Metro Manila",
      type: "corporate",
      capacity: 120,
      booked: null,
      revenue: null,
      img: "b.jpg",
      isPublic: true,
    });
  });

  it("falls back for a bare template", () => {
    expect(mapTemplateToEventItem({ id: "t2" })).toMatchObject({
      title: "Untitled",
      status: "draft",
      date: "—",
      loc: "—",
      img: "",
      venueConfirmation: "missing",
    });
  });
});

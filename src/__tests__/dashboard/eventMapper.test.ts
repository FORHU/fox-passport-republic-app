import { describe, it, expect } from "vitest";
import { mapTemplateToEventItem } from "@/features/dashboard/mappers/hostDashboard";

/**
 * BUG-20 (app#136): Creator Studio warned "Missing venue confirmation" on
 * every event, because it keyed on a status ("Ongoing") templates never have.
 * The card now follows the API's own `status` and `venueConfirmation`
 * (api#165), passed through as sent: the app works neither out itself.
 */

const template = {
  id: "t1",
  name: "Launch Night",
  status: "published",
  venueConfirmation: "pending",
  category: "corporate",
  targetCity: "Makati",
  targetState: "Metro Manila",
  maxAttendees: 120,
  createdAt: "2026-10-01T00:00:00.000Z",
  isPublic: true,
  images: [{ url: "a.jpg" }, { url: "b.jpg", isPrimary: true }],
};

describe("mapTemplateToEventItem", () => {
  it("passes the API's status and venue confirmation through as sent", () => {
    const item = mapTemplateToEventItem(template);
    expect(item.status).toBe("published");
    expect(item.venueConfirmation).toBe("pending");
  });

  it("leaves venue confirmation null when the API doesn't send it", () => {
    const { venueConfirmation: _omit, ...withoutField } = template;
    expect(
      mapTemplateToEventItem({
        ...withoutField,
        // Venue rows alone are not turned into a confirmation by the app.
        templateVenues: [{ venueId: "v1", matched: false }],
      }).venueConfirmation,
    ).toBeNull();
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

  it("falls back for display on a bare template", () => {
    expect(mapTemplateToEventItem({ id: "t2" })).toMatchObject({
      title: "Untitled",
      date: "—",
      loc: "—",
      img: "",
      venueConfirmation: null,
    });
  });
});
